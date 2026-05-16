# Stage Prompts — Recruitment Matchmaker Build

Copy-paste these prompts to Claude one at a time, in order. Each is self-contained — a fresh Claude instance can pick up the work from the prompt alone (plus the files referenced).

**Before starting:** confirm `plan.md` and `EXECUTION.md` are committed. The prompts reference them.

---

## Chunk 1 — Database + Worker bring-up (~1 hour, derisks the bundler)

Goal: prove `pgvector` is wired and the BGE worker loads in a real browser tab. No UI yet — just the bones.

> Build Stage 1 chunk 1 of the Recruitment Matchmaker, following `EXECUTION.md` sections 0, 1, and 2. Concretely:
>
> 1. Install `@huggingface/transformers`. Add `GROQ_MODEL` (default `llama-3.3-70b-versatile`) to `lib/env.ts`.
> 2. Add the `TalentProfile` model and `User.talentProfiles` back-reference to `prisma/schema.prisma` exactly as shown in EXECUTION.md §1.1.
> 3. Run `npx prisma migrate dev --create-only --name add_talent_profile`. Then **edit** the generated `migration.sql` to append the `CREATE EXTENSION vector`, the `ALTER TABLE ... DROP COLUMN embedding` + re-add as `vector(384)`, and the `talent_embedding_hnsw` HNSW index. Run `npx prisma migrate dev` to apply.
> 4. Create `lib/ai/embedding.worker.ts` and `lib/ai/worker-client.ts` exactly as shown in EXECUTION.md §2.1 and §2.2. Use `@huggingface/transformers` import (NOT the old `@xenova/transformers`). Model id stays `Xenova/bge-small-en-v1.5`.
> 5. Try `npm run dev` with **no** `next.config.mjs` changes first. If you see bundler errors mentioning `onnxruntime-node` or `sharp`, then (and only then) add the `turbopack.resolveAlias` block from EXECUTION.md §0.3. Do NOT add a `webpack:` block — Next.js 16 uses Turbopack by default for both dev and build, and a webpack config breaks `next build`.
>
> Smoke-check before declaring done:
> - `psql $DATABASE_URL -c "SELECT '[1,2,3]'::vector(3);"` returns `[1,2,3]`.
> - `psql $DATABASE_URL -c "\d \"TalentProfile\""` lists `talent_embedding_hnsw`.
> - Create a temporary `app/test-embed/page.tsx` (client component) that imports `embedPassage` from `@/lib/ai/worker-client`, calls it on "hello world" inside a `useEffect`, and renders `vector.length` plus `vector.slice(0, 4)`. Open the page in the browser; verify length is 384 and you see 4 small floats.
>
> Report back: (a) any bundler config you ended up needing, (b) the first 4 floats from the smoke test, (c) the migration file content. Do NOT delete `app/test-embed` yet — it's our health check until Chunk 2.

---

## Chunk 2 — Server actions + Upload + Search UI (~2 hours)

Goal: end-to-end vertical slice. Upload a resume, search by JD, see ranked results.

**Prerequisite:** Chunk 1 done; worker loads; you've seen 384-dim vectors in the browser.

> Build Stage 1 chunk 2 of the Recruitment Matchmaker, following `EXECUTION.md` sections 3, 4, and 5. Concretely:
>
> 1. Create `app/actions/talent.ts` with `ingestProfile`, `existingHashes`, `searchTalent`, `deleteProfile`, `clearPool` exactly as in §3. All five read `userId` from `auth()` — never from arguments. Use `db.$executeRaw` / `db.$queryRaw` for vector ops; serialize vectors as `` `[${vec.join(',')}]` ``.
> 2. Create `app/recruiter/page.tsx` (server component, gates on `auth()`) and `app/recruiter/RecruiterClient.tsx` (client wrapper with the model-loading progress UI) per §5.1 and §5.2.
> 3. Create `components/recruiter/UploadZone.tsx` and `components/recruiter/SearchPanel.tsx` per §5.3 and §5.4. UploadZone reuses the existing server action `parseResume` from `app/actions/parse-resume.ts` — do NOT write a new PDF parser.
> 4. Delete the temporary `app/test-embed/page.tsx` from Chunk 1.
> 5. Extract the `normalize(text)` helper into `lib/utils.ts` and import it from both `UploadZone.tsx` and `app/actions/talent.ts`. The client SHA-256 hash and the server `textHash` must be derived from the same normalization or dedup breaks.
>
> Smoke-check before declaring done:
> - Sign in at `/auth`, then visit `/recruiter`. Progress bar shows; resolves to the two-column UI.
> - Upload two different PDF resumes via the dropzone. Both should show "ingested" in the status list. `SELECT count(*) FROM "TalentProfile"` returns 2.
> - Re-upload one of them. Status shows "duplicate, skipped". Row count stays at 2.
> - Paste a JD that mentions skills from resume #1 prominently into SearchPanel, click "Find candidates". Resume #1 should appear at the top with a score > 50.
> - Sign in as a different user. `/recruiter` shows zero results — proves multi-tenant isolation works.
>
> Report back: (a) screenshots or descriptions of the three UI states (loading, empty, results), (b) the top-1 result score for your JD test, (c) any TypeScript or Prisma issues you hit and the fix. Do NOT proceed to Chunk 3 until search returns ranked results end-to-end.

---

## Chunk 3 — Eval Harness + Stage 1 Sign-off (~1 hour, plus fixtures)

Goal: prove the system works measurably, not just anecdotally.

**You owe me fixtures before this chunk runs.** Hand-pick or write **10 JDs** and **60 resumes** (3 relevant per JD, 30 distractors). Synthetic resumes from an LLM are acceptable for v1 but flag the eval as "synthetic-fixture floor" rather than real signal. Real samples from a public dataset (e.g., Kaggle resumes) are stronger.

> Build Stage 1 chunk 3 of the Recruitment Matchmaker — the eval harness — per `EXECUTION.md` §6. Concretely:
>
> 1. Create `eval/run.ts` exactly as in §6.2. Use `@huggingface/transformers` (not `@xenova/transformers`).
> 2. Confirm the fixtures already exist under `eval/fixtures/jds/*.txt`, `eval/fixtures/resumes/*.txt`, and `eval/fixtures/labels.json`. If they don't, STOP and ask me to provide them — do not fabricate them silently. Report the file count you see.
> 3. Add `"eval": "tsx eval/run.ts"` to `package.json` scripts. Install `tsx` as a devDependency.
> 4. Run `npm run eval`. It should print a table and append a Stage 1 row to `eval/results.md`.
> 5. Walk through the Stage 1 acceptance criteria in `plan.md` §10 (numbered list). For each criterion, state pass/fail and how you verified it. The numbers in `eval/results.md` decide whether we move on to Stage 2 or stop here.
>
> Report back:
> - The full Stage 1 row from `eval/results.md` (recall@10, MRR, pair count).
> - Pass/fail for all 7 acceptance criteria in `plan.md` §10.
> - One-line recommendation: "ship Stage 1, stop" or "ship Stage 1, then build Stage 2 (hybrid)" based on whether recall@10 is above or below 0.85.

---

## Stage 2+ (only if Chunk 3 says recall@10 < 0.85)

Don't run these yet. Drafts only.

### Chunk 4 — Hybrid retrieval (tsvector + RRF)

> Add the Stage 2 hybrid retrieval per `plan.md` §4. Concretely: extend the migration to add a `tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', "rawText")) STORED` column and a GIN index. Replace `searchTalent` with the RRF SQL from `plan.md` §4. Add a `mustHaveSkills: string[]` chip input to `SearchPanel`. Pass chips as the second SQL parameter via `chips.join(' ')` into `websearch_to_tsquery`.
>
> After implementation, run `npm run eval` (update `eval/run.ts` to mirror the new SQL — score by RRF instead of cosine). Append a Stage 2 row to `eval/results.md`. Report: Stage 2 recall@10 vs Stage 1, and whether the ≥ 3-point gain gate passed.

### Chunk 5 — Batched Groq pitch + missing-skill check

> Add the Stage 3 single-batched Groq call per `plan.md` §5. Use the existing `openai` SDK with `baseURL: "https://api.groq.com/openai/v1"` and `apiKey: env.GROQ_API_KEY`. Model: `env.GROQ_MODEL`. Send the top-5 candidates + must-have chips in ONE call, response in JSON mode. Demote candidates with non-empty `missingSkills` and show a badge in `SearchPanel`. Eval criterion is qualitative — test on 3 real JDs and report whether the pitches feel useful.

### Chunk 6 — Cross-encoder rerank (likely gets cut)

> Add the Stage 4 cross-encoder rerank per `plan.md` §6. Load `Xenova/ms-marco-MiniLM-L-6-v2` lazily in the worker. Add a `RERANK` message type. Tokenize JD (first 150 tokens) and resume (first 350 tokens) explicitly using the model's tokenizer — DO NOT rely on auto-truncation. Apply rerank on top-10 → top-5 after RRF, before Groq. Update `eval/run.ts` to include the rerank stage. Append a Stage 4 row. Gates (ALL must pass): recall@10 ≥ Stage 2 + 5pts, p95 search latency ≤ 3s, cold-start total download ≤ 60MB. If any gate fails, REVERT and write the reason in `eval/results.md` under "tried, did not help."

---

## How to use these prompts

1. Paste **Chunk 1** to Claude. Verify the smoke checks before paying for Chunk 2.
2. Paste **Chunk 2**. Verify before fixtures.
3. Generate or source **fixtures**. Commit them.
4. Paste **Chunk 3**. Read the numbers.
5. If recall@10 ≥ 0.85 — stop. Ship. Move on with your life.
6. Otherwise paste **Chunk 4**. Repeat the eval loop.

Stages 5 and 6 are likely overkill for a portfolio piece. If Stage 2 hits the 0.85 floor, ship and write up the eval methodology in your README — that's the senior signal, not adding more model layers.

---

## Notes & known constraints (Next.js 16, May 2026)

- **Next.js 16 (Turbopack default):** Do NOT add a `webpack:` config in `next.config.mjs`. `next build` refuses to silently pick between webpack and Turbopack — having both causes a build failure. Use top-level `turbopack.resolveAlias` only if the worker fails to load. Try with zero config first.
- **Package name:** `@huggingface/transformers` is the current name. `@xenova/transformers` is the legacy alias; don't install both. Same author (Xenova), same API.
- **Model id:** `Xenova/bge-small-en-v1.5` still works under the new package — Xenova namespace on the Hub is preserved.
- **Groq via OpenAI SDK:** No separate Groq SDK needed. `new OpenAI({ apiKey: env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })`. Already have `openai` in `package.json`.
- **Embedding lives in the browser.** Don't be tempted to move it server-side "for simplicity." The portfolio signal is the visible AI download + in-browser inference.
- **`ef_search` SET LOCAL is deferred.** Default 40 is fine until eval shows recall problems under filtering.
