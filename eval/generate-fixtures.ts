/**
 * Synthetic fixture generator for eval.
 *
 * Writes 10 JDs and 60 resumes into eval/fixtures/ with a known relevance structure
 * so we can measure recall@10 / MRR honestly.
 *
 * Caveat: these are SYNTHETIC. They prove the pipeline works and gives a sane floor,
 * but they don't represent real recruiter signal. Swap in real samples for serious eval.
 *
 * Run: tsx eval/generate-fixtures.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const FIXTURES = "eval/fixtures";

mkdirSync(join(FIXTURES, "jds"), { recursive: true });
mkdirSync(join(FIXTURES, "resumes"), { recursive: true });

type Role = {
  id: string;
  title: string;
  jd: string;
  skills: string[];
  bullets: string[];
};

const ROLES: Role[] = [
  {
    id: "backend-go",
    title: "Senior Go Backend Engineer",
    jd: `We are hiring a Senior Go Backend Engineer to build distributed systems for our payments platform.
You will design microservices, write idiomatic Go, work with gRPC and Kafka, optimize Postgres queries,
and own observability via Prometheus and Grafana. 5+ years backend experience required.
Bonus: Kubernetes, AWS, exposure to financial systems.`,
    skills: ["Go", "gRPC", "Kafka", "Postgres", "Prometheus", "Kubernetes", "AWS", "microservices"],
    bullets: [
      "Built payment ledger microservice in Go, processing 8M+ tx/day with sub-50ms p99 latency",
      "Designed Kafka-based event sourcing pipeline replacing legacy batch jobs",
      "Owned Prometheus + Grafana dashboards covering 40+ Go services",
      "Tuned PostgreSQL query plans, reduced p95 by 60% on a 2TB OLTP cluster",
      "Migrated 12 services to Kubernetes; wrote Helm charts and HPA configs",
    ],
  },
  {
    id: "frontend-react",
    title: "Senior Frontend Engineer (React)",
    jd: `Senior Frontend Engineer to lead our React + TypeScript web app. Strong TypeScript, React 18,
Next.js App Router, Tailwind, and accessibility (WCAG 2.1) expertise required. You will partner with
designers on a design system, ship visible features weekly, and improve Core Web Vitals.
Nice to have: GraphQL, Storybook, performance work (INP, LCP).`,
    skills: ["React", "TypeScript", "Next.js", "Tailwind", "GraphQL", "Storybook", "accessibility", "Core Web Vitals"],
    bullets: [
      "Led migration of 80-page Next.js app to App Router; cut LCP from 4.1s to 1.6s",
      "Built component library in React + TypeScript with Storybook (120 components, WCAG 2.1 AA)",
      "Shipped GraphQL client layer using Apollo with persisted queries and SSR hydration",
      "Drove INP from 380ms to 90ms via React 18 concurrent features and judicious memoization",
      "Designed Tailwind-based theming system supporting 4 brand variants",
    ],
  },
  {
    id: "ml-nlp",
    title: "Machine Learning Engineer — NLP",
    jd: `ML Engineer focused on NLP. You will train and serve transformer models, build retrieval-augmented
generation pipelines, evaluate with recall@k and MRR, and ship inference services. Strong Python,
PyTorch, Hugging Face Transformers, and vector DB (pgvector / Weaviate / Pinecone) experience required.
Bonus: ONNX, distillation, cross-encoder reranking.`,
    skills: ["Python", "PyTorch", "Transformers", "Hugging Face", "RAG", "pgvector", "ONNX", "reranking"],
    bullets: [
      "Built a RAG search system using pgvector + HNSW indexing for 12M doc corpus",
      "Fine-tuned a cross-encoder reranker (ms-marco-MiniLM) lifting NDCG@10 by 14 points",
      "Distilled a 110M-param BERT into a 33M-param student with 96% accuracy retention",
      "Served ONNX-quantized embedding model with sub-30ms p95 via FastAPI",
      "Designed eval harness measuring recall@10, MRR, and latency across 4 retrieval configs",
    ],
  },
  {
    id: "data-eng",
    title: "Data Engineer (Spark / Snowflake)",
    jd: `Data Engineer to build batch and streaming pipelines. Spark, Airflow, dbt, Snowflake, and
strong SQL required. You will own the warehouse data model, write idempotent transformations,
and partner with analytics on metric definitions. 4+ yrs experience preferred.`,
    skills: ["Spark", "Airflow", "dbt", "Snowflake", "SQL", "warehousing", "streaming", "Python"],
    bullets: [
      "Owned 200+ dbt models in Snowflake powering the company-wide metrics layer",
      "Migrated 14 Airflow DAGs from PythonOperator to KubernetesPodOperator for reproducibility",
      "Built Spark streaming job consuming Kafka, writing Delta tables at 4K events/sec",
      "Designed late-arriving fact handling via dbt snapshots and Type 2 SCDs",
      "Cut Snowflake spend 38% by rewriting top-10 cost-driver queries and adding clustering keys",
    ],
  },
  {
    id: "devops-sre",
    title: "SRE / DevOps Engineer",
    jd: `SRE to own production reliability. Kubernetes, Terraform, AWS, observability (Prometheus,
Loki, OpenTelemetry), and incident management experience required. You will write runbooks,
own SLOs, lead postmortems, and reduce on-call burden.`,
    skills: ["Kubernetes", "Terraform", "AWS", "Prometheus", "OpenTelemetry", "SRE", "incident management", "SLO"],
    bullets: [
      "Reduced p2 incident count by 55% over 6 months via SLO discipline and error budgets",
      "Owned Terraform monorepo provisioning 14 AWS accounts with Atlantis-based PR workflow",
      "Built OpenTelemetry pipeline replacing 3 fragmented tracing stacks",
      "Led 12 postmortems; published blameless RCA template adopted org-wide",
      "Drove on-call pager volume from 22/wk to 4/wk via alert hygiene + SLO refinement",
    ],
  },
  {
    id: "mobile-ios",
    title: "Senior iOS Engineer",
    jd: `Senior iOS Engineer to ship our flagship mobile app. Swift, SwiftUI, Combine, and strong
architecture skills required. Familiar with Core Data, CoreML, push notifications, and App Store
release process. 5+ years iOS experience preferred.`,
    skills: ["Swift", "SwiftUI", "Combine", "Core Data", "CoreML", "iOS", "Xcode", "App Store"],
    bullets: [
      "Shipped 4 major releases of consumer iOS app in Swift + SwiftUI (4.7 star, 2M MAU)",
      "Adopted Combine for state management replacing legacy RxSwift across 60+ screens",
      "Integrated CoreML on-device classifier dropping inference latency from 800ms to 120ms",
      "Built offline-first sync layer in Core Data with conflict resolution",
      "Owned App Store release process; cut review-to-rollout time from 5 days to 30 hours",
    ],
  },
  {
    id: "security-appsec",
    title: "Application Security Engineer",
    jd: `AppSec engineer to embed security across the SDLC. Threat modeling, secure code review,
OWASP Top 10, SAST/DAST tooling, and CSP / OAuth / OIDC expertise required. You will run our
bug bounty triage and partner with product engineering on critical features.`,
    skills: ["AppSec", "OWASP", "threat modeling", "SAST", "DAST", "OAuth", "OIDC", "CSP"],
    bullets: [
      "Ran 28 threat modeling sessions across product features; tracked 140+ mitigations to closure",
      "Tuned Semgrep + CodeQL rules cutting SAST false positives from 70% to 12%",
      "Triaged 200+ HackerOne reports; established severity rubric adopted org-wide",
      "Wrote Content Security Policy roll-out plan; deployed in 6 services without regression",
      "Audited OAuth + OIDC flows in 4 SSO integrations, found and fixed two redirect issues",
    ],
  },
  {
    id: "product-design",
    title: "Senior Product Designer",
    jd: `Product Designer for a B2B SaaS dashboard. Figma, prototyping, design systems, user research,
and strong typography skills required. You will partner with PM and engineering from discovery to
ship. Portfolio of shipped enterprise tools preferred.`,
    skills: ["Figma", "design systems", "prototyping", "user research", "typography", "B2B SaaS", "Auto Layout", "interaction design"],
    bullets: [
      "Owned design system in Figma (Auto Layout, variables) used by 30+ product engineers",
      "Ran 24 user research sessions with enterprise admins shaping our permissions UX",
      "Shipped a redesigned dashboard reducing time-to-first-insight from 4.2 to 1.1 minutes",
      "Defined typography scale and grid for B2B web app adopted across 8 product surfaces",
      "Prototyped 3 interaction patterns in Figma; A/B tested winning variant lifted activation 9%",
    ],
  },
  {
    id: "qa-automation",
    title: "QA / Test Automation Engineer",
    jd: `QA Automation engineer to build and own our E2E test suite. Playwright or Cypress, CI/CD
familiarity (GitHub Actions), and test design skills required. You will partner with product
engineers on testability and flake reduction.`,
    skills: ["Playwright", "Cypress", "E2E testing", "GitHub Actions", "test automation", "flake reduction", "CI/CD"],
    bullets: [
      "Built 320-test Playwright suite covering 12 product surfaces, run on every PR",
      "Drove suite flake rate from 11% to under 0.4% via wait strategy audit and isolation",
      "Designed GitHub Actions matrix sharding cutting E2E wall time from 38 to 9 minutes",
      "Wrote internal test-pyramid guide adopted by 14 engineering squads",
      "Integrated Percy visual regression catching 30+ UI regressions before production",
    ],
  },
  {
    id: "engineering-manager",
    title: "Engineering Manager (Platform)",
    jd: `Engineering Manager for our platform team. 2+ yrs management experience, strong technical
background (any backend stack), and proven track record of hiring, coaching, and shipping.
You will run weekly 1:1s, drive quarterly planning, and represent the team to leadership.`,
    skills: ["engineering management", "hiring", "coaching", "1:1", "planning", "leadership", "platform engineering", "OKR"],
    bullets: [
      "Managed 8-engineer platform team; ran weekly 1:1s, quarterly career conversations",
      "Hired 5 engineers in 9 months with 90% offer-to-accept rate",
      "Drove quarterly planning aligning team roadmap to company OKRs",
      "Coached two seniors into staff roles via stretch assignments and structured feedback",
      "Represented platform team to leadership in monthly engineering review",
    ],
  },
];

const DISTRACTOR_BULLETS = [
  "Coordinated weekly bake sales raising $4,200 for the local food bank",
  "Won the company foosball tournament three quarters in a row",
  "Maintained the office plants and authored the watering schedule wiki",
  "Hosted monthly lightning-talk Fridays attended by 40+ engineers",
  "Helped run the summer internship program (12 interns, 9 returned full-time)",
  "Built the team's hackathon project: a Slack bot that suggests lunch spots",
];

const labels: Record<string, string[]> = {};

let resumeIndex = 0;

function writeResume(text: string, isRelevantFor?: string) {
  resumeIndex += 1;
  const id = `resume-${String(resumeIndex).padStart(3, "0")}`;
  writeFileSync(join(FIXTURES, "resumes", `${id}.txt`), text);
  if (isRelevantFor) {
    labels[isRelevantFor] = labels[isRelevantFor] ?? [];
    labels[isRelevantFor].push(id);
  }
  return id;
}

function relevantResume(role: Role, variant: number): string {
  // 3 variants per role with slightly different framings — same skill signal
  const opener = [
    `${variant === 0 ? "Senior" : variant === 1 ? "Staff" : "Lead"} engineer with deep experience in ${role.skills.slice(0, 3).join(", ")}.`,
    `Engineer focused on ${role.skills[0]} and ${role.skills[1]}; ${variant + 4}+ years professional experience.`,
    `Practitioner in ${role.skills.join(", ")} with a record of shipping production systems.`,
  ][variant % 3];

  const bullets = role.bullets.slice(0, 3 + (variant % 2)).map((b) => `- ${b}`);
  const tools = `Tools: ${role.skills.join(", ")}.`;

  return [opener, "", "Experience:", ...bullets, "", tools].join("\n");
}

function distractorResume(role: Role, otherRole: Role): string {
  // A resume that's loosely in a different role but shares 1 weak signal with `role`
  return [
    `Generalist contributor.`,
    "",
    "Experience:",
    `- ${otherRole.bullets[0]}`,
    `- ${otherRole.bullets[1]}`,
    `- ${DISTRACTOR_BULLETS[resumeIndex % DISTRACTOR_BULLETS.length]}`,
    "",
    `Tools: ${otherRole.skills.slice(0, 4).join(", ")}.`,
  ].join("\n");
}

// 10 JDs
for (const role of ROLES) {
  writeFileSync(join(FIXTURES, "jds", `${role.id}.txt`), role.jd);
}

// 3 relevant resumes per role = 30 relevant resumes
for (const role of ROLES) {
  for (let v = 0; v < 3; v++) {
    writeResume(relevantResume(role, v), role.id);
  }
}

// 30 distractors (3 per role drawn from other roles)
for (const role of ROLES) {
  for (let v = 0; v < 3; v++) {
    const otherRole = ROLES[(ROLES.indexOf(role) + v + 1) % ROLES.length];
    writeResume(distractorResume(role, otherRole));
  }
}

writeFileSync(
  join(FIXTURES, "labels.json"),
  JSON.stringify(labels, null, 2) + "\n",
);

console.log(
  `Generated ${ROLES.length} JDs and ${resumeIndex} resumes into ${FIXTURES}/`,
);
console.log(`Labels: ${Object.keys(labels).length} JDs with relevant resumes`);
