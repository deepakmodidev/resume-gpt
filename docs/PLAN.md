# Technical Specification: AI Recruitment Matchmaker (v6 — Right-Sized)

A semantic candidate-ranking engine. Shipped in stages. Every quality addition is gated by an eval result, not a hunch.

**Guiding rule:** the eval harness comes online in Stage 1 alongside the dumbest possible retrieval. Every later stage either improves recall@10 / MRR by a measurable margin or gets cut and documented.

---

## 1. Stages at a glance

| Stage | Scope | Effort | Ship gate |
| ----- | ----- | ------ | --------- |
| **1 — MVP** | Dense-only retrieval, eval harness, dedup, multi-tenant | ~1 week | recall@10 ≥ 0.6 on eval set |
| **2 — Hybrid** | Add `tsvector` + RRF fusion | +2 days | recall@10 ≥ Stage 1 + 3 pts |
| **3 — LLM polish** | One batched Groq call → pitch + missing-skills per search | +2 days | Qualitative recruiter test |
| **4 — Rerank** | Cross-encoder rerank top-10 → top-5 | +2 days | recall@10 ≥ Stage 2 + 5 pts AND p95 ≤ 3s |

Stages 2–4 are optional. A failed gate → revert, document in `eval/results.md` under "tried, did not help."

This staging is the portfolio signal: in 2026, "I built it and measured each addition" beats "I built everything at once."

---

## 2. Stack

| Layer | Choice |
| ----- | ------ |
| Embedding model | `Xenova/bge-small-en-v1.5` (384-dim, normalized, asymmetric prefix) |
| Vector DB | PostgreSQL + `pgvector`, HNSW (`vector_cosine_ops`) |
| Worker | `lib/workers/embedding.worker.ts` (Web Worker) |
| Extraction | `unpdf` (PDF), `mammoth` (DOCX) |
| LLM (Stage 3+) | Groq, model name in `GROQ_MODEL` env var |
| Reranker (Stage 4) | `Xenova/ms-marco-MiniLM-L-6-v2` |
| ORM | Prisma 6 (raw SQL for vector ops) |

---

## 3. Stage 1 — MVP (must ship)

### 3.1 Schema

```prisma
model TalentProfile {
  id        String   @id @default(cuid())
  userId    String
  rawText   String   @db.Text
  textHash  String                          // SHA-256 of normalized rawText
  embedding Unsupported("vector(384)")
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, textHash])
  @@index([userId])
}
```

**Migration:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX talent_embedding_hnsw
  ON "TalentProfile" USING hnsw (embedding vector_cosine_ops);
```

**Deliberately cut from earlier drafts:**
- `name / email / phone` columns — no parser shipped; display first 300 chars of `rawText` as a snippet instead. Add parsing only if recruiters complain.
- `modelId` / `needsReembed` — no model changes planned. Dead columns are noise.
- `tsv` column — Stage 2.
- Rate limiting — Stage 3+ if needed.

### 3.2 Worker

`lib/workers/embedding.worker.ts` — one model, two request kinds.

```ts
type Req =
  | { id: string; kind: 'PASSAGE'; text: string }   // resume
  | { id: string; kind: 'QUERY';   text: string };  // JD

type Res =
  | { id: string; ok: true;  vector: number[] }
  | { id: string; ok: false; error: string }
  | { kind: 'PROGRESS'; loaded: number; total: number };
```

Rules:
- BGE query-prefix on `QUERY` only: `"Represent this sentence for searching relevant passages: "`.
- `pipeline(..., { pooling: 'mean', normalize: true })`.
- **Truncate to 512 tokens.** No chunking in Stage 1. Document the quality assumption in `eval/results.md`; chunking is a Stage 4 candidate if eval shows it's needed.
- `lib/ai/worker-client.ts` — thin singleton, `Promise`-per-request via id correlation, one optional progress callback. No EventEmitter.

### 3.3 Ingestion

Client:
1. Dropzone: max 20 files, MIME (PDF/DOCX), 5MB cap.
2. Extract text (`unpdf` / `mammoth`).
3. Normalize: `text.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ')` → SHA-256 → `textHash`.
4. Embed via worker.
5. POST to `ingestProfile`.

Server (`ingestProfile`):
- `userId` from session, **never** from payload.
- Raw SQL `INSERT ... ON CONFLICT (userId, textHash) DO NOTHING` (the unique constraint enforces dedup under races).
- Vector → `[${vec.join(',')}]` → `$1::vector`.

### 3.4 Search

`searchTalent({ jdText })`:

```sql
SET LOCAL hnsw.ef_search = 100;
SELECT id, "rawText", embedding <=> $1::vector AS distance
FROM   "TalentProfile"
WHERE  "userId" = $2
ORDER  BY embedding <=> $1::vector
LIMIT  10;
```

Return `[{ id, snippet: rawText.slice(0, 300), score: round((1 - distance) * 100) }]`.

### 3.5 UI

`app/recruiter/page.tsx` — two columns.
- Left: dropzone + uploaded count + per-file processing status.
- Right: JD textarea + ranked results with score + snippet.
- **First-load state (the bit v4 forgot):** "Loading AI engine — ~25MB, one-time download" + progress bar fed by worker `PROGRESS`. Upload and search disabled until ready.

### 3.6 Lifecycle

- `deleteProfile(id)` — `WHERE id = $1 AND userId = $2`.
- `clearPool()` — bulk delete by `userId`.
- No CSV export. (PII export is a compliance question; defer.)

### 3.7 Eval Harness (`eval/`)

Built in Stage 1. Non-negotiable.

- **Dataset:** 30 JD↔resume pairs (10 JDs × 3 relevant) + 30 distractor resumes. Pool size: 60.
- **Metrics:** `recall@10`, `MRR`, search latency p50/p95.
- **Runner:** `npm run eval` reads fixtures, runs `searchTalent` against a test DB, writes one row per stage to `eval/results.md`.
- **Methodology note** (`eval/README.md`): 30 pairs is small; treat ±2 points as no change. Expand if the project gets serious.

---

## 4. Stage 2 — Hybrid (gated)

**Trigger:** Stage 1 eval shows specific failures where a JD's rare token (company, niche tech) is in the resume but dense ranking misses it. If Stage 1 already nails this, skip Stage 2.

Add:
- `tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', "rawText")) STORED` — `'simple'`, not `'english'`. English stemming mangles `.NET`, `C++`, `Node.js`. For tech recruitment, `'simple'` is better.
- GIN index on `tsv`.
- Chip input: `mustHaveSkills: string[]` (manual entry, no LLM extraction).

Hybrid SQL (RRF, k=60):

```sql
WITH dense AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) r
  FROM   "TalentProfile" WHERE "userId" = $3
  ORDER  BY embedding <=> $1::vector LIMIT 50
),
sparse AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(tsv, q, 32) DESC) r
  FROM   "TalentProfile", websearch_to_tsquery('simple', $2) q
  WHERE  "userId" = $3 AND tsv @@ q
  ORDER  BY ts_rank(tsv, q, 32) DESC LIMIT 50
)
SELECT id,
       COALESCE(1.0/(60+dense.r), 0) + COALESCE(1.0/(60+sparse.r), 0) AS rrf
FROM   dense FULL OUTER JOIN sparse USING (id)
ORDER  BY rrf DESC LIMIT 10;
```

Chip → query string: `chips.join(' ')` (websearch parser treats whitespace as AND). `ts_rank` normalization flag `32` divides by `1 + log(unique_words)` to dampen long-resume bias.

**Ship gate:** Stage 2 recall@10 ≥ Stage 1 + 3 pts. Otherwise revert.

---

## 5. Stage 3 — One LLM call per search (gated)

**Not one call per candidate.** v4's audit + pitch design burned 10 calls per search; this burns 1.

Pass the top-5 + must-have chips in one Groq call:

```
For each of the 5 candidates below, write a 2-sentence pitch
and list which required skills are NOT confirmed by the resume.

Required skills: [...]
Candidates:
1. [id] <<<text...>>>
2. ...

Return JSON: { "results": [{ "id", "pitch", "missingSkills": [] }] }
```

- `temperature: 0.2`, `max_tokens: 600`, JSON mode.
- `GROQ_MODEL` from env so model deprecation is a config change.
- Candidates with `missingSkills.length > 0` are **demoted** (badge in UI), not removed.

**Ship gate:** qualitative — test on 3 real JDs. If pitches aren't useful, ship missing-skills only or cut Stage 3.

---

## 6. Stage 4 — Cross-encoder rerank (gated, often skipped)

Add `Xenova/ms-marco-MiniLM-L-6-v2` to the worker, loaded lazily.

**Truncation policy (v4's silent bug):** total input ≤ 512 tokens.
- JD: first 150 tokens.
- Resume: first 350 tokens.
- Tokenize both explicitly; don't rely on model defaults.

**Ship gates (all three must pass):**
1. recall@10 ≥ Stage 2 + 5 pts on eval.
2. p95 search latency ≤ 3s.
3. Cold-start download (BGE + cross-encoder + WASM) ≤ 60MB.

Also requires: `next.config.js` headers `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` for multi-threaded WASM. Without these, rerank latency triples.

**If any gate fails:** ship without rerank, document in `eval/results.md`. This is the most likely stage to get cut — and cutting it cleanly is itself signal.

---

## 7. Hard constraints (every stage)

| Rule | Reason |
| ---- | ------ |
| `userId` from session only | Multi-tenant safety |
| Vectors L2-normalized | Cosine math |
| BGE query-prefix on JD only | Model card |
| `ON CONFLICT (userId, textHash) DO NOTHING` | Concurrent dedup |
| `SET LOCAL hnsw.ef_search = 100` per search tx | Recall under filter |
| Model name + prefix string in one constant | No drift |
| `npm run eval` runs before merging a stage | No vibe-based claims |

---

## 8. Known limitations (accepted, not fixed)

1. **HNSW with `WHERE userId = $n`** loses some recall on selective filters. Fine under ~5K profiles/user; partition if scale comes.
2. **No name/email/phone parser.** Snippet-only display in v1.
3. **PDF re-exports may hash differently** (different page headers, OCR variation). Acceptable.
4. **No chunking in Stage 1.** Resumes >512 tokens silently truncated. Documented in eval.
5. **In-process deployment assumed.** Worker singleton + any rate limiter are per-process. Serverless needs rework.
6. **English-only.** `'simple'` tsvector helps tech terms but not other languages.
7. **No candidate-identity model.** Same person, updated resume = two rows. Recruiter manages.
8. **30-pair eval is small.** Use ±2-pt band as "no change."

---

## 9. Out of scope (v1)

- LLM-based skill extraction from JD.
- Audit logs / telemetry / Sentry.
- CSV / bulk export.
- Team accounts (shared candidate pools).
- Auto re-vectorization on model change.
- Per-candidate notes, tags, or workflow state.

---

## 10. Stage 1 acceptance criteria

1. `npm run eval` runs end-to-end and writes `eval/results.md` with a Stage 1 row.
2. Stage 1 recall@10 ≥ 0.6 on committed eval set.
3. 20-file batch upload completes; re-upload produces 0 new rows.
4. p95 search latency < 1.5s on the eval pool.
5. Grep audit: no server action reads `userId` from client payload.
6. First-load UI shows model-download progress; buttons gated until ready.
7. Deleting the `User` cascades and removes all their `TalentProfile` rows.

---

## 11. Branch

`feat/recruiter-matchmaker`
