/**
 * Stage 1 eval runner — dense-only retrieval with BGE.
 *
 * Computes recall@10 and MRR over the labeled fixtures. Appends a row to
 * eval/results.md so we can compare stages over time.
 *
 * Run: npm run eval
 */
import { pipeline, env } from "@huggingface/transformers";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

env.allowLocalModels = false;

const FIXTURES = "eval/fixtures";
const MODEL = "Xenova/bge-small-en-v1.5";
const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

function cosine(a: number[], b: number[]): number {
  // Vectors are L2-normalized, so cosine = dot product
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

async function embed(
  pipe: any,
  text: string,
  isQuery: boolean,
): Promise<number[]> {
  const input = isQuery ? QUERY_PREFIX + text : text;
  const out = await pipe(input, { pooling: "mean", normalize: true });
  return Array.from(out.data as Float32Array);
}

async function main() {
  console.log("Loading model...");
  const pipe = await pipeline("feature-extraction", MODEL);

  const resumesDir = join(FIXTURES, "resumes");
  const jdsDir = join(FIXTURES, "jds");
  const labelsPath = join(FIXTURES, "labels.json");

  if (!existsSync(labelsPath)) {
    console.error(
      `Missing ${labelsPath}. Run \`tsx eval/generate-fixtures.ts\` first.`,
    );
    process.exit(1);
  }

  const resumeFiles = readdirSync(resumesDir).filter((f) => f.endsWith(".txt"));
  const jdFiles = readdirSync(jdsDir).filter((f) => f.endsWith(".txt"));
  const labels = JSON.parse(readFileSync(labelsPath, "utf8")) as Record<
    string,
    string[]
  >;

  console.log(
    `Embedding ${resumeFiles.length} resumes...`,
  );
  const resumeVecs: Record<string, number[]> = {};
  for (const f of resumeFiles) {
    const id = f.replace(".txt", "");
    const text = readFileSync(join(resumesDir, f), "utf8");
    resumeVecs[id] = await embed(pipe, text, false);
  }

  console.log(`Searching ${jdFiles.length} JDs...`);
  let totalRecall = 0;
  let totalMRR = 0;
  let latencyTotalMs = 0;
  let n = 0;

  for (const f of jdFiles) {
    const jdId = f.replace(".txt", "");
    const text = readFileSync(join(jdsDir, f), "utf8");

    const t0 = Date.now();
    const qVec = await embed(pipe, text, true);
    const ranked = Object.entries(resumeVecs)
      .map(([rid, rvec]) => ({ rid, score: cosine(qVec, rvec) }))
      .sort((a, b) => b.score - a.score);
    latencyTotalMs += Date.now() - t0;

    const relevant = new Set(labels[jdId] ?? []);
    if (relevant.size === 0) continue;

    const top10 = ranked.slice(0, 10).map((r) => r.rid);
    const hits = top10.filter((rid) => relevant.has(rid)).length;
    const recall = hits / relevant.size;

    let mrr = 0;
    for (let i = 0; i < ranked.length; i++) {
      if (relevant.has(ranked[i].rid)) {
        mrr = 1 / (i + 1);
        break;
      }
    }

    console.log(
      `  ${jdId}: recall@10=${recall.toFixed(2)}  MRR=${mrr.toFixed(3)}  top3=[${top10
        .slice(0, 3)
        .join(", ")}]`,
    );

    totalRecall += recall;
    totalMRR += mrr;
    n += 1;
  }

  const recall10 = totalRecall / n;
  const mrr = totalMRR / n;
  const avgLatency = Math.round(latencyTotalMs / n);

  const row =
    `\n## Stage 1 — Dense-only (BGE)\n\n` +
    `- recall@10: **${recall10.toFixed(3)}**\n` +
    `- MRR: **${mrr.toFixed(3)}**\n` +
    `- avg query latency: ${avgLatency} ms (CPU, Node)\n` +
    `- JD count: ${n}\n` +
    `- resume pool: ${resumeFiles.length}\n` +
    `- date: ${new Date().toISOString()}\n` +
    `- note: synthetic fixtures — represents floor, not real recruiter signal\n`;

  console.log("\n=== Stage 1 Results ===");
  console.log(`recall@10: ${recall10.toFixed(3)}`);
  console.log(`MRR:       ${mrr.toFixed(3)}`);
  console.log(`avg query latency: ${avgLatency} ms`);

  const resultsPath = "eval/results.md";
  const header = existsSync(resultsPath)
    ? ""
    : "# Eval Results — Recruitment Matchmaker\n\nAppended in order. Each stage adds a row.\n";
  writeFileSync(resultsPath, header + row, { flag: "a" });
  console.log(`\nAppended to ${resultsPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
