/**
 * Integration / stress test for the Recruiter Matchmaker feature.
 *
 * Covers every server action and HTTP route related to /recruiter by replaying
 * their exact SQL and shapes against the live Neon DB. Embeddings are computed
 * with the same BGE model the browser worker uses.
 *
 * Test rows are tagged with a marker and removed at the end. Existing rows are
 * never touched. clearPool() is intentionally NOT exercised.
 *
 * Endpoints / actions covered:
 *   - poolCount()          ← server action + GET /recruiter/api/count
 *   - existingHashes()     ← server action
 *   - ingestProfile()      ← server action (same INSERT ... ON CONFLICT path)
 *   - searchTalent()       ← server action (same HNSW cosine query)
 *   - deleteProfile()      ← server action
 *
 * Run:
 *   node scripts/bulk-test.mjs
 */

import { PrismaClient } from "@prisma/client";
import { pipeline, env as hfEnv } from "@huggingface/transformers";
import { createHash, randomUUID } from "crypto";
import { performance } from "perf_hooks";

hfEnv.allowLocalModels = false;
hfEnv.cacheDir = ".cache/transformers";

const MODEL_ID = "Xenova/bge-small-en-v1.5";
const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";
const MARKER = "[STRESS_TEST_BULK_2026_05_16]";
const TEST_USER_ID = "cmd8k56570000l104w28cckbo";
const EMBED_DIM = 384;

const db = new PrismaClient();

function normalizeForHash(text) {
  return text.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}
function hashText(text) {
  return createHash("sha256").update(normalizeForHash(text)).digest("hex");
}
function toVectorLiteral(vec) {
  return `[${vec.join(",")}]`;
}
function pct(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}
function fmt(ms) {
  return `${ms.toFixed(0)}ms`;
}
function banner(title) {
  console.log(`\n=== ${title} ===`);
}

const PROFILES = [
  { role: "senior-backend-go", text: `${MARKER} Senior backend engineer with 8 years building distributed systems in Go and Rust. Deep PostgreSQL expertise: query planning, partitioning, replication. Led migration of payment service from monolith to event-driven microservices on Kubernetes. Comfortable with gRPC, NATS, Kafka. Strong on observability: OpenTelemetry, Prometheus, structured logging. Mentored 4 junior engineers.` },
  { role: "junior-frontend-react", text: `${MARKER} Junior frontend developer, recent CS graduate. Strong in React 18, TypeScript, Tailwind CSS. Built three production single-page apps during internship including a customer dashboard with chart.js. Learning Next.js app router. Comfortable with REST APIs, basic accessibility, responsive design. Eager to grow into a full-stack role.` },
  { role: "ml-engineer-llm", text: `${MARKER} Machine learning engineer focused on LLM training and inference. PyTorch, JAX, HuggingFace Transformers daily. Shipped a retrieval-augmented generation system with vector indexing in production. Fine-tuned Llama and Mistral models with LoRA and QLoRA. Quantization, distillation, vLLM. Comfortable with CUDA and Triton kernels.` },
  { role: "mobile-react-native", text: `${MARKER} Mobile engineer with 5 years across React Native and native iOS in Swift. Shipped consumer apps with 2M downloads. Strong on offline-first sync, push notifications via FCM and APNs, in-app purchases. Comfortable with Detox and Fastlane. Some Android Kotlin experience for native modules.` },
  { role: "devops-aws-terraform", text: `${MARKER} DevOps engineer specializing in AWS infrastructure-as-code. Terraform, CDK, EKS, Lambda, RDS, CloudFront. Built CI/CD with GitHub Actions and ArgoCD. Migrated three clients from manual deploys to GitOps. SOC2 compliance experience. Strong shell scripting and Python automation.` },
  { role: "data-engineer-spark", text: `${MARKER} Data engineer working with Spark, Airflow, dbt, Snowflake. Designed and maintained petabyte-scale data lake on S3 with Iceberg tables. Pipeline reliability is my thing — built data quality monitors and incident response playbooks. SQL is my native language. Python for transformations.` },
  { role: "product-designer-figma", text: `${MARKER} Product designer with strong UX research foundation. Figma, Framer, design systems thinking. Led design for a fintech B2B SaaS through Series A. Conducted 40+ user interviews and synthesized into product strategy. Comfortable handing off to engineers and pair-designing in code with React.` },
  { role: "ios-swift-native", text: `${MARKER} iOS engineer specializing in Swift and SwiftUI. 6 years shipping native apps including a top-100 health app. Strong on Core Data, Combine, async/await concurrency, accessibility. WWDC attendee since 2019. Mentored junior iOS engineers on architecture patterns.` },
  { role: "fullstack-next-postgres", text: `${MARKER} Full-stack developer working primarily in TypeScript across Next.js, Node.js, and PostgreSQL. Shipped multiple production apps with authentication, payments via Stripe, and real-time features via websockets. Comfortable with Prisma, Drizzle, tRPC. Recently learning pgvector for semantic search.` },
  { role: "cybersec-pentest", text: `${MARKER} Offensive security engineer with OSCP and CRTP. Five years in red team operations and application penetration testing. Strong with Burp, ffuf, BloodHound, Mimikatz. Wrote a custom C2 framework for internal use. Reported 30+ vulnerabilities to vendor bug bounty programs.` },
  { role: "game-unity-csharp", text: `${MARKER} Game developer with Unity and C#. Shipped two indie titles on Steam plus contract work on a mobile RPG. Strong on gameplay programming, shader work in HLSL, performance profiling, and procedural generation. Some Unreal Engine 5 with Blueprints.` },
  { role: "embedded-c-rtos", text: `${MARKER} Embedded firmware engineer for ARM Cortex-M and Cortex-A microcontrollers. C and a bit of C++. FreeRTOS, Zephyr. Hardware bring-up, sensor drivers via I2C and SPI, OTA update mechanisms. Worked on industrial IoT devices for predictive maintenance.` },
  { role: "sre-observability", text: `${MARKER} Site reliability engineer with deep observability and incident management background. Built SLO frameworks, runbooks, and on-call rotations for a 200-engineer org. Strong with Datadog, Grafana, Honeycomb, eBPF tracing. Postmortem facilitation and reliability culture advocacy.` },
  { role: "pm-analytics", text: `${MARKER} Product manager with technical background. Owned roadmap for a developer-tools product through 10x ARR growth. Strong with SQL, Amplitude, Mixpanel, basic Python for analysis. Wrote PRDs and led discovery interviews. Worked closely with design and engineering on iterative shipping.` },
  { role: "qa-cypress-playwright", text: `${MARKER} QA automation engineer specializing in end-to-end testing. Cypress, Playwright, Jest. Built test infrastructure that reduced regression bugs in production by 60 percent. Strong on test architecture, flaky test triage, and visual regression. Some performance testing with k6.` },
];

const JDS = [
  {
    label: "Senior Go backend",
    expectedTop: "senior-backend-go",
    text: "We are hiring a senior backend engineer with deep Go experience and strong PostgreSQL skills. You will design distributed systems, lead microservices on Kubernetes, and mentor junior engineers. Observability and event-driven architecture experience required.",
  },
  {
    label: "Frontend with design eye",
    expectedTop: "junior-frontend-react",
    text: "Looking for a frontend developer comfortable in React and TypeScript who cares about user experience. You will build responsive interfaces and partner with designers on a customer-facing dashboard.",
  },
  {
    label: "ML engineer for LLM inference",
    expectedTop: "ml-engineer-llm",
    text: "Hiring an ML engineer to own LLM fine-tuning and inference infrastructure. Experience with PyTorch, HuggingFace, LoRA, and serving frameworks like vLLM. Bonus for CUDA and quantization expertise.",
  },
  {
    label: "DevOps lead AWS",
    expectedTop: "devops-aws-terraform",
    text: "We need a DevOps lead to own AWS infrastructure-as-code with Terraform, EKS, and GitHub Actions. SOC2 compliance background a plus. You will mentor the platform team and drive GitOps adoption.",
  },
  {
    label: "SRE for high-traffic systems",
    expectedTop: "sre-observability",
    text: "Hiring a site reliability engineer to run on-call, build SLO frameworks, and improve observability across our stack. Experience with Grafana, Datadog, incident management, and postmortem facilitation expected.",
  },
];

async function loadBge() {
  const t0 = performance.now();
  const pipe = await pipeline("feature-extraction", MODEL_ID);
  console.log(`BGE loaded in ${fmt(performance.now() - t0)}`);
  return pipe;
}

async function embed(pipe, text, isQuery = false) {
  const input = isQuery ? QUERY_PREFIX + text : text;
  const out = await pipe(input, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

// === server-action SQL replays =============================================

async function actionPoolCount() {
  const t0 = performance.now();
  const n = await db.talentProfile.count({ where: { userId: TEST_USER_ID } });
  return { count: n, ms: performance.now() - t0 };
}

async function actionExistingHashes(hashes) {
  const t0 = performance.now();
  const rows = await db.talentProfile.findMany({
    where: { userId: TEST_USER_ID, textHash: { in: hashes } },
    select: { textHash: true },
  });
  return { hashes: rows.map((r) => r.textHash), ms: performance.now() - t0 };
}

async function actionIngestProfile(rawText, vector) {
  const t0 = performance.now();
  const textHash = hashText(rawText);
  const id = randomUUID();
  const vecLit = toVectorLiteral(vector);
  const affected = await db.$executeRawUnsafe(
    `INSERT INTO "TalentProfile" (id, "userId", "rawText", "textHash", embedding, "createdAt")
     VALUES ($1, $2, $3, $4, $5::vector, NOW())
     ON CONFLICT ("userId", "textHash") DO NOTHING`,
    id,
    TEST_USER_ID,
    rawText,
    textHash,
    vecLit,
  );
  return { id, textHash, inserted: affected === 1, ms: performance.now() - t0 };
}

async function actionSearchTalent(jdVector) {
  const t0 = performance.now();
  const vecLit = toVectorLiteral(jdVector);
  const rows = await db.$queryRawUnsafe(
    `SELECT id, "rawText", (embedding <=> $1::vector) AS distance
     FROM "TalentProfile"
     WHERE "userId" = $2 AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT 10`,
    vecLit,
    TEST_USER_ID,
  );
  const results = rows.map((r) => ({
    id: r.id,
    snippet: r.rawText.slice(0, 80),
    distance: Number(r.distance),
    score: Math.max(0, Math.min(100, Math.round((1 - Number(r.distance)) * 100))),
  }));
  return { results, ms: performance.now() - t0 };
}

async function actionDeleteProfile(id) {
  const t0 = performance.now();
  const r = await db.talentProfile.deleteMany({
    where: { id, userId: TEST_USER_ID },
  });
  return { deleted: r.count, ms: performance.now() - t0 };
}

async function cleanup() {
  const r = await db.$executeRawUnsafe(
    `DELETE FROM "TalentProfile" WHERE "userId" = $1 AND "rawText" LIKE $2`,
    TEST_USER_ID,
    `${MARKER}%`,
  );
  return r;
}

// === main =================================================================

async function main() {
  console.log("Recruiter Matchmaker — bulk integration test");
  console.log(`marker:  ${MARKER}`);
  console.log(`userId:  ${TEST_USER_ID}`);
  console.log(`profiles: ${PROFILES.length}, JDs: ${JDS.length}`);

  const pipe = await loadBge();

  // [1] poolCount() — baseline
  banner("[1/7] poolCount() — initial");
  const initial = await actionPoolCount();
  console.log(`existing rows: ${initial.count}  (${fmt(initial.ms)})`);

  // [2] embed all profiles in parallel
  banner("[2/7] embed all 15 profiles");
  const tEmbedAll = performance.now();
  const profilesWithVec = [];
  for (const p of PROFILES) {
    const v = await embed(pipe, p.text, false);
    if (v.length !== EMBED_DIM) throw new Error(`Bad dim: ${v.length}`);
    profilesWithVec.push({ ...p, vector: v });
  }
  console.log(`embedded ${PROFILES.length} profiles in ${fmt(performance.now() - tEmbedAll)}`);

  // [3] existingHashes() — check none present
  banner("[3/7] existingHashes() — probe before insert");
  const allHashes = profilesWithVec.map((p) => hashText(p.text));
  const probe1 = await actionExistingHashes(allHashes);
  console.log(`already present: ${probe1.hashes.length} / ${allHashes.length}  (${fmt(probe1.ms)})`);

  // [4] ingestProfile() x N
  banner("[4/7] ingestProfile() bulk insert");
  const ingestMs = [];
  const insertedIds = [];
  for (const p of profilesWithVec) {
    const r = await actionIngestProfile(p.text, p.vector);
    ingestMs.push(r.ms);
    if (r.inserted) insertedIds.push({ id: r.id, role: p.role });
    process.stdout.write(`  ${p.role.padEnd(28)} ${r.inserted ? "OK" : "DUP"} ${fmt(r.ms).padStart(7)}\n`);
  }
  console.log(`\nbulk ingest: ${insertedIds.length}/${PROFILES.length} inserted`);
  console.log(`  p50=${fmt(pct(ingestMs, 0.5))}  p95=${fmt(pct(ingestMs, 0.95))}  p99=${fmt(pct(ingestMs, 0.99))}`);

  // [4b] dedup: re-ingest first profile, expect DUP
  const dup = await actionIngestProfile(profilesWithVec[0].text, profilesWithVec[0].vector);
  console.log(`  dedup re-ingest: ${dup.inserted ? "FAIL (inserted again)" : "OK (no-op, expected)"}`);

  // [4c] poolCount after bulk
  const afterBulk = await actionPoolCount();
  console.log(`  poolCount after bulk: ${afterBulk.count}  (delta = +${afterBulk.count - initial.count})`);

  // [5] searchTalent() x M JDs
  banner("[5/7] searchTalent() across 5 JDs");
  const searchMs = [];
  let topMatches = 0;
  for (const jd of JDS) {
    const jdVec = await embed(pipe, jd.text, true);
    const s = await actionSearchTalent(jdVec);
    searchMs.push(s.ms);
    const top = s.results[0];
    const topRole = top?.snippet
      .replace(MARKER, "")
      .trim()
      .split(/[ .]/)
      .slice(0, 4)
      .join(" ");
    const matches = top && PROFILES.find((p) => p.role === jd.expectedTop && top.snippet.includes(p.text.slice(0, 40)));
    if (matches) topMatches++;
    console.log(
      `  ${jd.label.padEnd(32)} top=${top?.score ?? "?"}%  ${matches ? "✓ matched expected" : "✗ different top"}  ${fmt(s.ms)}`,
    );
    console.log(`    ${topRole}...`);
  }
  console.log(`\nsearch: ${topMatches}/${JDS.length} JDs had expected top result`);
  console.log(`  p50=${fmt(pct(searchMs, 0.5))}  p95=${fmt(pct(searchMs, 0.95))}  p99=${fmt(pct(searchMs, 0.99))}`);

  // [6] deleteProfile()
  banner("[6/7] deleteProfile() — single row");
  if (insertedIds.length > 0) {
    const target = insertedIds[0];
    const del = await actionDeleteProfile(target.id);
    console.log(`  deleted role=${target.role}: ${del.deleted} row  (${fmt(del.ms)})`);
    const after = await actionPoolCount();
    console.log(`  poolCount after delete: ${after.count}  (delta = -1 expected)`);
  } else {
    console.log("  no inserted rows to delete");
  }

  // [7] concurrent search burst
  banner("[7/7] concurrent search burst — 20 parallel queries");
  const burstJD = await embed(pipe, JDS[0].text, true);
  const tBurst = performance.now();
  const burstResults = await Promise.all(
    Array.from({ length: 20 }, () => actionSearchTalent(burstJD)),
  );
  const burstTotal = performance.now() - tBurst;
  const burstMs = burstResults.map((r) => r.ms);
  console.log(`  wall clock: ${fmt(burstTotal)}  (effective QPS = ${(20000 / burstTotal).toFixed(1)})`);
  console.log(`  per-query p50=${fmt(pct(burstMs, 0.5))}  p95=${fmt(pct(burstMs, 0.95))}  max=${fmt(Math.max(...burstMs))}`);

  // cleanup
  banner("cleanup");
  const removed = await cleanup();
  console.log(`removed ${removed} stress-test rows`);
  const final = await actionPoolCount();
  console.log(`final poolCount: ${final.count}  (expected: ${initial.count})`);
  if (final.count === initial.count) {
    console.log("\n✓ ALL CLEAN — your original data is intact.");
  } else {
    console.log("\n⚠ row count mismatch — investigate.");
  }
}

main()
  .catch((e) => {
    console.error("\nbulk-test FAILED:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
