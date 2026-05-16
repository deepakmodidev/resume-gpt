# Execution Guide — Stage 1 MVP

Concrete, file-by-file build order for the Recruitment Matchmaker. Follow top-to-bottom. Each step has the code skeleton, the file path, and the gotchas.

Plan reference: `plan.md` (v6). This document is the "how"; `plan.md` is the "what and why."

---

## 0. Setup (10 min)

### 0.1 Install dependencies

```bash
npm install @huggingface/transformers
```

That's the only new dep. `@huggingface/transformers` is the current name for what used to be `@xenova/transformers` — same API, actively maintained, `Xenova/bge-small-en-v1.5` still works as the model id. `unpdf`, `mammoth`, `openai`, `zod`, `prisma` are already there.

### 0.2 Env vars

`lib/env.ts` already has `GROQ_API_KEY` (optional). Add to `.env.local`:

```
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

Add `GROQ_MODEL` to `envSchema` in `lib/env.ts`:

```ts
GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
```

(Stage 3 only — fine to skip until then.)

### 0.3 Next config (Next.js 16 — Turbopack is default)

`next.config.mjs` — `@huggingface/transformers` ships a `package.json` `exports` map that picks the right runtime per environment, so on Next.js 16 the **first thing to try is no config at all**. Run `npm run dev` and see if the worker loads. If you get bundler errors for `onnxruntime-node` or `sharp`, add the Turbopack alias:

```js
// inside nextConfig
turbopack: {
  resolveAlias: {
    // Conditional aliases — only applied for browser builds
    "onnxruntime-node": { browser: "@huggingface/transformers" },
    sharp: { browser: "@huggingface/transformers" },
  },
},
serverExternalPackages: [
  ...(nextConfig.serverExternalPackages ?? []),
  "onnxruntime-node",
],
```

**Do NOT add a `webpack:` block** — in Next.js 16, having a `webpack` config alongside the default Turbopack build causes `next build` to fail (it refuses to silently pick one). If a future bundler issue forces webpack, you'd run `next build --webpack` explicitly, but it's a fallback, not the path.

Reference: the official Hugging Face Next.js example uses a webpack-style alias because it targets older Next versions; for Next.js 16, the equivalent is `turbopack.resolveAlias` above.

---

## 1. Database (Phase 1) — 30 min

### 1.1 Update Prisma schema

**File:** `prisma/schema.prisma` — append at the end:

```prisma
model TalentProfile {
  id        String   @id @default(cuid())
  userId    String
  rawText   String   @db.Text
  textHash  String
  embedding Unsupported("vector(384)")?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, textHash])
  @@index([userId])
}
```

Add the relation back-pointer to `User`:

```prisma
model User {
  // existing fields...
  talentProfiles TalentProfile[]
}
```

`embedding` is nullable so insert-then-update works if you ever decouple embedding from ingest. For Stage 1 we always set it on insert.

### 1.2 Create the migration

```bash
npx prisma migrate dev --create-only --name add_talent_profile
```

Open the generated `prisma/migrations/<timestamp>_add_talent_profile/migration.sql` and **edit it** — add the extension and HNSW index. The Prisma-generated SQL creates the table; you append:

```sql
-- Append to the bottom of the generated migration.sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Prisma creates `embedding` as a text column with Unsupported. Drop & re-add:
ALTER TABLE "TalentProfile" DROP COLUMN "embedding";
ALTER TABLE "TalentProfile" ADD COLUMN "embedding" vector(384);

CREATE INDEX "talent_embedding_hnsw"
  ON "TalentProfile"
  USING hnsw (embedding vector_cosine_ops);
```

Apply it:

```bash
npx prisma migrate dev
npx prisma generate
```

**Gotcha:** if your Postgres host (Supabase, Neon, etc.) doesn't have `pgvector` pre-installed, enable it in their dashboard first or the `CREATE EXTENSION` fails.

### 1.3 Quick smoke test

```bash
psql $DATABASE_URL -c "SELECT '[1,2,3]'::vector(3);"
```

Should print `[1,2,3]`. If it errors with "type vector does not exist," the extension didn't apply.

---

## 2. Embedding Worker (Phase 2) — 1-2 hours

The single most important AI piece. Two files.

### 2.1 The worker

**File:** `lib/ai/embedding.worker.ts`

```ts
/// <reference lib="webworker" />
import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "Xenova/bge-small-en-v1.5";
const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

type Req =
  | { id: string; kind: "PASSAGE"; text: string }
  | { id: string; kind: "QUERY"; text: string };

type Res =
  | { id: string; ok: true; vector: number[] }
  | { id: string; ok: false; error: string }
  | { kind: "PROGRESS"; loaded: number; total: number };

let extractor: any = null;

async function getExtractor() {
  if (extractor) return extractor;
  extractor = await pipeline("feature-extraction", MODEL_ID, {
    progress_callback: (p: any) => {
      if (p.status === "progress") {
        self.postMessage({ kind: "PROGRESS", loaded: p.loaded, total: p.total } as Res);
      }
    },
  });
  return extractor;
}

self.onmessage = async (e: MessageEvent<Req>) => {
  const req = e.data;
  try {
    const pipe = await getExtractor();
    const input = req.kind === "QUERY" ? QUERY_PREFIX + req.text : req.text;
    const output = await pipe(input, { pooling: "mean", normalize: true });
    const vector = Array.from(output.data as Float32Array);
    self.postMessage({ id: req.id, ok: true, vector } as Res);
  } catch (err: any) {
    self.postMessage({ id: req.id, ok: false, error: err?.message ?? "embed failed" } as Res);
  }
};

export {};
```

**Gotcha 1 — Truncation:** `@xenova/transformers` will silently truncate inputs >512 tokens to 512. Acceptable for Stage 1 per plan. Don't add chunking yet.

**Gotcha 2 — Output shape:** `output.data` is a `Float32Array` of length 384 when `pooling: 'mean'` is set. If you forget `pooling`, you get a flat array of `tokens × 384` — wrong shape, no error, silent bug.

### 2.2 The client (singleton)

**File:** `lib/ai/worker-client.ts`

```ts
"use client";

type ProgressCb = (loaded: number, total: number) => void;

let worker: Worker | null = null;
let progressCb: ProgressCb | null = null;
const pending = new Map<string, { resolve: (v: number[]) => void; reject: (e: Error) => void }>();

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./embedding.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.kind === "PROGRESS") {
      progressCb?.(msg.loaded, msg.total);
      return;
    }
    const slot = pending.get(msg.id);
    if (!slot) return;
    pending.delete(msg.id);
    if (msg.ok) slot.resolve(msg.vector);
    else slot.reject(new Error(msg.error));
  };
  return worker;
}

export function onWorkerProgress(cb: ProgressCb) {
  progressCb = cb;
}

function embed(kind: "PASSAGE" | "QUERY", text: string): Promise<number[]> {
  const w = ensureWorker();
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, kind, text });
  });
}

export const embedPassage = (text: string) => embed("PASSAGE", text);
export const embedQuery = (text: string) => embed("QUERY", text);
```

**Gotcha:** `new URL("./embedding.worker.ts", import.meta.url)` is the Next.js / Turbopack-supported way to spawn typed workers. Do **not** use a string path.

---

## 3. Server actions (Phase 3) — 1 hour

Three actions. All read `userId` from session.

### 3.1 Ingest

**File:** `app/actions/talent.ts`

```ts
"use server";

import { auth } from "@/lib/auth";
import db from "@/prisma/prisma";
import { createHash } from "crypto";
import { logger } from "@/lib/logger";

function normalize(text: string): string {
  return text.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

function hashText(text: string): string {
  return createHash("sha256").update(normalize(text)).digest("hex");
}

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

export async function ingestProfile(rawText: string, vector: number[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (vector.length !== 384) throw new Error("Bad vector dim");
  if (!rawText?.trim()) throw new Error("Empty text");

  const userId = session.user.id;
  const textHash = hashText(rawText);
  const vecLit = toVectorLiteral(vector);

  try {
    await db.$executeRaw`
      INSERT INTO "TalentProfile" (id, "userId", "rawText", "textHash", embedding, "createdAt")
      VALUES (${crypto.randomUUID()}, ${userId}, ${rawText}, ${textHash}, ${vecLit}::vector, NOW())
      ON CONFLICT ("userId", "textHash") DO NOTHING
    `;
    return { ok: true as const };
  } catch (err) {
    logger.error("ingestProfile failed", { err, userId });
    return { ok: false as const, error: "Ingest failed" };
  }
}
```

**Gotcha — Prisma raw SQL + pgvector:** Prisma's tagged-template `$executeRaw` parameter-binds the JS string, so `${vecLit}` lands in the SQL as a quoted text literal, and `::vector` casts it. **Do not** try to pass a JS array — pgvector won't accept a `text[]` cast.

### 3.2 Dedup pre-check (optional UX win)

```ts
export async function existingHashes(hashes: string[]): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rows = await db.talentProfile.findMany({
    where: { userId: session.user.id, textHash: { in: hashes } },
    select: { textHash: true },
  });
  return rows.map((r) => r.textHash);
}
```

Lets the client skip embedding work for already-uploaded resumes.

### 3.3 Search

```ts
export async function searchTalent(jdVector: number[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (jdVector.length !== 384) throw new Error("Bad JD vector dim");

  const userId = session.user.id;
  const vecLit = toVectorLiteral(jdVector);

  const rows = await db.$queryRaw<
    Array<{ id: string; rawText: string; distance: number }>
  >`
    SELECT id, "rawText", embedding <=> ${vecLit}::vector AS distance
    FROM "TalentProfile"
    WHERE "userId" = ${userId}
    ORDER BY embedding <=> ${vecLit}::vector
    LIMIT 10
  `;

  return rows.map((r) => ({
    id: r.id,
    snippet: r.rawText.slice(0, 300),
    score: Math.round((1 - Number(r.distance)) * 100),
  }));
}
```

**Gotcha — `ef_search`:** the `SET LOCAL hnsw.ef_search = 100` in plan.md requires the SET and the SELECT to be in the same transaction. With Prisma tagged-template you'd need `db.$transaction([...])`. For Stage 1 with low row counts the default `ef_search = 40` is fine — skip the SET until eval shows recall problems.

### 3.4 Lifecycle (2-line CRUD)

```ts
export async function deleteProfile(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db.talentProfile.deleteMany({ where: { id, userId: session.user.id } });
}

export async function clearPool() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db.talentProfile.deleteMany({ where: { userId: session.user.id } });
}
```

---

## 4. Text extraction shim (reuse existing) — 5 min

`app/actions/parse-resume.ts` already exports `parseResume(formData)`. Use it as-is for uploads.

No changes needed. Just import it in the upload handler.

---

## 5. UI (Phase 3) — 2-3 hours

Three components + one page.

### 5.1 Page layout

**File:** `app/recruiter/page.tsx`

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecruiterClient from "./RecruiterClient";

export default async function RecruiterPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  return <RecruiterClient />;
}
```

### 5.2 Client wrapper

**File:** `app/recruiter/RecruiterClient.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { onWorkerProgress, embedPassage, embedQuery } from "@/lib/ai/worker-client";
import UploadZone from "@/components/recruiter/UploadZone";
import SearchPanel from "@/components/recruiter/SearchPanel";

export default function RecruiterClient() {
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onWorkerProgress((loaded, total) => {
      setProgress({ loaded, total });
      if (loaded >= total) setReady(true);
    });
    // Warm the worker by issuing a tiny embed
    embedPassage("warmup").then(() => setReady(true)).catch(() => {});
  }, []);

  if (!ready) {
    const pct = progress ? Math.round((progress.loaded / progress.total) * 100) : 0;
    return (
      <div className="p-12 max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Loading AI engine</h2>
        <p className="text-sm text-muted-foreground mb-3">
          One-time ~25MB download. Cached in your browser.
        </p>
        <div className="h-2 w-full bg-gray-200 rounded">
          <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs">{pct}%</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <UploadZone embedPassage={embedPassage} />
      <SearchPanel embedQuery={embedQuery} />
    </div>
  );
}
```

### 5.3 Upload zone

**File:** `components/recruiter/UploadZone.tsx`

```tsx
"use client";

import { useState } from "react";
import { ingestProfile, existingHashes } from "@/app/actions/talent";
import { parseResume } from "@/app/actions/parse-resume";

const MAX_FILES = 20;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalize(text: string): string {
  return text.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

export default function UploadZone({ embedPassage }: { embedPassage: (t: string) => Promise<number[]> }) {
  const [status, setStatus] = useState<string[]>([]);

  async function handleFiles(files: FileList) {
    const arr = Array.from(files).slice(0, MAX_FILES);
    setStatus([]);

    for (const file of arr) {
      const log = (msg: string) => setStatus((s) => [...s, `${file.name}: ${msg}`]);
      if (!ALLOWED.has(file.type)) { log("unsupported type"); continue; }
      if (file.size > MAX_BYTES) { log("too large"); continue; }

      const fd = new FormData();
      fd.append("file", file);
      const { text, error } = await parseResume(fd);
      if (error || !text) { log(error ?? "no text"); continue; }

      const hash = await sha256Hex(normalize(text));
      const existing = await existingHashes([hash]);
      if (existing.includes(hash)) { log("duplicate, skipped"); continue; }

      const vector = await embedPassage(text);
      const res = await ingestProfile(text, vector);
      log(res.ok ? "ingested" : res.error);
    }
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      <input
        type="file"
        multiple
        accept=".pdf,.docx"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <ul className="mt-4 text-sm space-y-1">
        {status.map((s, i) => (<li key={i}>{s}</li>))}
      </ul>
    </div>
  );
}
```

**Gotcha — hash mismatch:** the client computes `hash = sha256(normalize(text))`. The server also normalizes inside `ingestProfile` — make sure both call the same `normalize()` logic. Easiest fix: put `normalize` in `lib/utils.ts` and import from both. Currently it's duplicated; refactor when you have a second consumer.

### 5.4 Search panel

**File:** `components/recruiter/SearchPanel.tsx`

```tsx
"use client";

import { useState } from "react";
import { searchTalent } from "@/app/actions/talent";

type Result = { id: string; snippet: string; score: number };

export default function SearchPanel({ embedQuery }: { embedQuery: (t: string) => Promise<number[]> }) {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  async function run() {
    if (!jd.trim()) return;
    setBusy(true);
    try {
      const vec = await embedQuery(jd);
      const rows = await searchTalent(vec);
      setResults(rows);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="border rounded p-3 min-h-[160px]"
        placeholder="Paste the job description…"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />
      <button
        onClick={run}
        disabled={busy}
        className="self-start px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {busy ? "Searching…" : "Find candidates"}
      </button>
      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.id} className="border rounded p-3">
            <div className="text-sm font-semibold">Match: {r.score}%</div>
            <div className="text-xs text-muted-foreground mt-1">{r.snippet}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Eval Harness (Phase 6) — 2 hours

Non-negotiable. Build it last but commit it before merging Stage 1.

### 6.1 Fixtures

**Files:** `eval/fixtures/jds/jd-01.txt` … `jd-10.txt` and `eval/fixtures/resumes/resume-001.txt` … `resume-060.txt`.

**Labels:** `eval/fixtures/labels.json`

```json
{
  "jd-01": ["resume-003", "resume-017", "resume-042"],
  "jd-02": ["resume-008", "resume-021", "resume-055"]
}
```

Hand-write 10 JDs, 60 resumes, 3 labeled-relevant per JD. The other 30 are distractors. Pull real samples from public resume datasets if you don't want to fabricate.

### 6.2 Runner

**File:** `eval/run.ts`

```ts
import { pipeline, env } from "@huggingface/transformers";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

env.allowLocalModels = false;

const FIXTURES = "eval/fixtures";
const MODEL = "Xenova/bge-small-en-v1.5";
const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are L2-normalized
}

async function embed(pipe: any, text: string, isQuery: boolean): Promise<number[]> {
  const out = await pipe(isQuery ? QUERY_PREFIX + text : text, { pooling: "mean", normalize: true });
  return Array.from(out.data as Float32Array);
}

async function main() {
  const pipe = await pipeline("feature-extraction", MODEL);

  const resumeFiles = readdirSync(join(FIXTURES, "resumes")).filter((f) => f.endsWith(".txt"));
  const jdFiles = readdirSync(join(FIXTURES, "jds")).filter((f) => f.endsWith(".txt"));
  const labels = JSON.parse(readFileSync(join(FIXTURES, "labels.json"), "utf8")) as Record<string, string[]>;

  const resumeVecs: Record<string, number[]> = {};
  for (const f of resumeFiles) {
    const id = f.replace(".txt", "");
    const text = readFileSync(join(FIXTURES, "resumes", f), "utf8");
    resumeVecs[id] = await embed(pipe, text, false);
  }

  let totalRecall = 0;
  let totalMRR = 0;
  let n = 0;

  for (const f of jdFiles) {
    const jdId = f.replace(".txt", "");
    const text = readFileSync(join(FIXTURES, "jds", f), "utf8");
    const qVec = await embed(pipe, text, true);

    const ranked = Object.entries(resumeVecs)
      .map(([rid, rvec]) => ({ rid, score: cosine(qVec, rvec) }))
      .sort((a, b) => b.score - a.score);

    const relevant = new Set(labels[jdId] ?? []);
    const top10 = ranked.slice(0, 10).map((r) => r.rid);
    const hits = top10.filter((rid) => relevant.has(rid)).length;
    const recall = hits / relevant.size;

    let mrr = 0;
    for (let i = 0; i < ranked.length; i++) {
      if (relevant.has(ranked[i].rid)) { mrr = 1 / (i + 1); break; }
    }

    totalRecall += recall;
    totalMRR += mrr;
    n += 1;
  }

  const result = {
    stage: "1-dense-only",
    recall_at_10: (totalRecall / n).toFixed(3),
    mrr: (totalMRR / n).toFixed(3),
    pairs: n,
    date: new Date().toISOString(),
  };

  console.table([result]);
  writeFileSync("eval/results.md", `\n## ${result.stage}\n\n` +
    `- recall@10: **${result.recall_at_10}**\n` +
    `- MRR: **${result.mrr}**\n` +
    `- pairs: ${result.pairs}\n` +
    `- date: ${result.date}\n`, { flag: "a" });
}

main().catch((e) => { console.error(e); process.exit(1); });
```

### 6.3 Wire it up

`package.json`:

```json
"scripts": {
  "eval": "tsx eval/run.ts"
}
```

```bash
npm install -D tsx
npm run eval
```

Commit `eval/results.md` after every meaningful change.

---

## 7. Smoke test checklist (before claiming Stage 1 done)

Run these in order. If any fails, stop and fix.

| # | Check | How |
|---|-------|-----|
| 1 | `pgvector` extension works | `psql $DATABASE_URL -c "SELECT '[1,2,3]'::vector(3);"` |
| 2 | HNSW index exists | `psql $DATABASE_URL -c "\d \"TalentProfile\""` shows `talent_embedding_hnsw` |
| 3 | Worker loads and embeds | open `/recruiter`, watch progress bar → "ready" state |
| 4 | First-time download visible | hard refresh (Ctrl+Shift+R), confirm progress bar appears |
| 5 | Upload + dedup | upload same PDF twice, second time shows "duplicate, skipped" |
| 6 | Search returns ranked results | upload 3 resumes, paste a JD that matches one, top hit is correct |
| 7 | Multi-tenant isolation | sign in as user B, confirm A's profiles are invisible |
| 8 | Cascade delete | delete user row in DB, profiles removed |
| 9 | Eval runs end-to-end | `npm run eval` writes a row to `eval/results.md` |
| 10 | Stage 1 recall floor | `recall@10 ≥ 0.6` on committed eval set |

---

## 8. Common bugs to expect

| Symptom | Probable cause | Fix |
|---------|----------------|-----|
| `type "vector" does not exist` | Extension not created | Run `CREATE EXTENSION vector` manually in DB |
| Worker errors `onnxruntime-node not found` | Turbopack tried to bundle Node ONNX for browser | Apply `turbopack.resolveAlias` from §0.3 |
| `next build` fails: "Custom webpack config used with Turbopack" | Leftover `webpack:` block in `next.config.mjs` | Remove it; use `turbopack:` config instead |
| Embeddings are 384-token-arrays (wrong shape) | Forgot `pooling: 'mean'` | Pass `{ pooling: 'mean', normalize: true }` to pipeline call |
| All search scores ~50% | Vectors not normalized — cosine math broken | Confirm `normalize: true` |
| Search returns nothing | HNSW index built, but vectors never inserted | Check `embedding` column after ingest — should be non-NULL |
| Same resume = different hashes | Client and server normalize differently | Extract `normalize()` into a shared `lib/utils.ts` |
| Worker re-downloads model every reload | `useBrowserCache` not set | Confirm `env.useBrowserCache = true` in worker |
| Match score is negative | Distance > 1 (vectors not normalized) | Normalize, or clamp: `Math.max(0, score)` |

---

## 9. After Stage 1 ships

Run `npm run eval`. Read the numbers. Then decide:

- **recall@10 ≥ 0.85?** Stage 1 is already excellent. Stop building, polish the UI, ship.
- **recall@10 between 0.6 and 0.85?** Build Stage 2 (hybrid + tsvector). Re-run eval.
- **recall@10 < 0.6?** Something is wrong — model misconfigured, fixtures bad, or BGE prefix mistake. Don't add complexity; debug.

Stages 2, 3, 4 each get their own `EXECUTION-stage-N.md` when you're ready. Don't write them now.

---

## 10. File map summary

New files:
```
lib/ai/embedding.worker.ts
lib/ai/worker-client.ts
app/actions/talent.ts
app/recruiter/page.tsx
app/recruiter/RecruiterClient.tsx
components/recruiter/UploadZone.tsx
components/recruiter/SearchPanel.tsx
eval/run.ts
eval/fixtures/jds/*.txt
eval/fixtures/resumes/*.txt
eval/fixtures/labels.json
eval/results.md
prisma/migrations/<timestamp>_add_talent_profile/migration.sql
```

Modified files:
```
prisma/schema.prisma         (add TalentProfile, User.talentProfiles)
next.config.mjs              (turbopack.resolveAlias — only if needed)
package.json                 (add @huggingface/transformers, tsx, eval script)
lib/env.ts                   (add GROQ_MODEL — Stage 3, optional now)
```

Untouched / reused as-is:
```
app/actions/parse-resume.ts  (parseFileToText, parseResume)
lib/auth.ts                  (auth())
prisma/prisma.ts             (db)
lib/logger.ts                (logger)
```

That's the whole Stage 1. ~6-10 hours of focused work.
