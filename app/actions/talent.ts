"use server";

import { createHash, randomUUID } from "crypto";
import { OpenAI } from "openai";
import { auth } from "@/lib/auth";
import db from "@/prisma/prisma";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { normalizeForHash } from "@/lib/utils";

const EMBED_DIM = 384;

const SCORE_FLOOR = 0.5;
const SCORE_CEILING = 0.7;

function calibrateScore(distance: number): number {
  const cosine = 1 - distance;
  const calibrated = (cosine - SCORE_FLOOR) / (SCORE_CEILING - SCORE_FLOOR);
  return Math.max(0, Math.min(100, Math.round(calibrated * 100)));
}

function hashText(text: string): string {
  return createHash("sha256").update(normalizeForHash(text)).digest("hex");
}

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function ingestProfile(
  rawText: string,
  vector: number[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const userId = await requireUserId();
    if (!rawText?.trim()) return { ok: false, error: "Empty text" };
    if (vector.length !== EMBED_DIM)
      return { ok: false, error: `Bad vector dim: ${vector.length}` };

    const textHash = hashText(rawText);
    const id = randomUUID();
    const vecLit = toVectorLiteral(vector);

    await db.$executeRawUnsafe(
      `INSERT INTO "TalentProfile" (id, "userId", "rawText", "textHash", embedding, "createdAt")
       VALUES ($1, $2, $3, $4, $5::vector, NOW())
       ON CONFLICT ("userId", "textHash") DO NOTHING`,
      id,
      userId,
      rawText,
      textHash,
      vecLit,
    );

    return { ok: true };
  } catch (err) {
    logger.error("ingestProfile failed", err);
    return { ok: false, error: "Ingest failed" };
  }
}

export async function existingHashes(hashes: string[]): Promise<string[]> {
  if (!hashes.length) return [];
  const userId = await requireUserId();
  const rows = await db.talentProfile.findMany({
    where: { userId, textHash: { in: hashes } },
    select: { textHash: true },
  });
  return rows.map((r) => r.textHash);
}

export type SearchResult = {
  id: string;
  snippet: string;
  score: number;
  name: string | null;
  email: string | null;
};

export type PoolProfile = {
  id: string;
  snippet: string;
  createdAt: string;
};

export async function listProfiles(): Promise<PoolProfile[]> {
  const userId = await requireUserId();
  const rows = await db.talentProfile.findMany({
    where: { userId },
    select: { id: true, rawText: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    snippet: r.rawText,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type PoolProfileWithOwner = PoolProfile & {
  name: string | null;
  email: string | null;
};

export async function listAllProfiles(): Promise<PoolProfileWithOwner[]> {
  await requireUserId();
  const rows = await db.talentProfile.findMany({
    select: {
      id: true,
      rawText: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return rows.map((r) => ({
    id: r.id,
    snippet: r.rawText,
    createdAt: r.createdAt.toISOString(),
    name: r.user?.name ?? null,
    email: r.user?.email ?? null,
  }));
}

export async function searchTalent(
  jdVector: number[],
): Promise<SearchResult[]> {
  await requireUserId();
  if (jdVector.length !== EMBED_DIM)
    throw new Error(`Bad JD vector dim: ${jdVector.length}`);

  const vecLit = toVectorLiteral(jdVector);

  const rows = await db.$queryRawUnsafe<
    Array<{
      id: string;
      rawText: string;
      name: string | null;
      email: string | null;
      distance: number;
    }>
  >(
    `SELECT t.id, t."rawText", u.name AS name, u.email AS email,
            (t.embedding <=> $1::vector) AS distance
     FROM "TalentProfile" t
     JOIN "User" u ON u.id = t."userId"
     WHERE t.embedding IS NOT NULL
     ORDER BY t.embedding <=> $1::vector
     LIMIT 10`,
    vecLit,
  );

  return rows.map((r) => {
    const distance = Number(r.distance);
    return {
      id: r.id,
      snippet: r.rawText.slice(0, 300),
      score: calibrateScore(distance),
      name: r.name,
      email: r.email,
    };
  });
}

export async function deleteProfile(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const userId = await requireUserId();
    await db.talentProfile.deleteMany({ where: { id, userId } });
    return { ok: true };
  } catch (err) {
    logger.error("deleteProfile failed", err);
    return { ok: false, error: "Delete failed" };
  }
}

export async function removeFromPool(
  textHash: string,
): Promise<{ ok: boolean; deleted?: number; error?: string }> {
  try {
    const userId = await requireUserId();
    const r = await db.talentProfile.deleteMany({
      where: { userId, textHash },
    });
    return { ok: true, deleted: r.count };
  } catch (err) {
    logger.error("removeFromPool failed", err);
    return { ok: false, error: "Remove failed" };
  }
}

export async function clearPool(): Promise<{ ok: true; deleted: number }> {
  const userId = await requireUserId();
  const r = await db.talentProfile.deleteMany({ where: { userId } });
  return { ok: true, deleted: r.count };
}

export async function poolCount(): Promise<number> {
  await requireUserId();
  return db.talentProfile.count();
}

// ============================================================================
// Stage 3 — RAG: generate per-candidate pitch + missing-skills using Groq LLM
// ============================================================================

export type CandidateInsight = {
  id: string;
  pitch: string;
  missingSkills: string[];
  concerns: string[];
};

const INSIGHTS_SYSTEM_PROMPT = `You are an expert technical recruiter analyzing candidate fit for a job description. You output STRICT JSON only — no markdown, no prose outside the JSON object, no code fences.`;

function buildInsightsUserPrompt(
  jd: string,
  candidates: Array<{ id: string; rawText: string }>,
): string {
  const blocks = candidates
    .map(
      (c, i) =>
        `[CANDIDATE ${i + 1}] (id: ${c.id})\n${c.rawText.slice(0, 4000)}`,
    )
    .join("\n\n---\n\n");

  return `JOB DESCRIPTION:
${jd}

CANDIDATES (top ${candidates.length} from semantic search):

${blocks}

For each candidate above, produce:
- "pitch": a 2-3 sentence pitch explaining why this specific candidate fits this specific role. Reference concrete evidence from their resume.
- "missingSkills": array of 1-3 skills/qualifications explicitly required by the JD that the resume does NOT clearly demonstrate. Empty array if nothing is missing.
- "concerns": array of 0-2 specific fit concerns (e.g. seniority mismatch, domain gap). Empty array if none.

Return STRICT JSON in EXACTLY this shape:
{
  "insights": [
    { "id": "<exact id from above>", "pitch": "...", "missingSkills": [...], "concerns": [...] }
  ]
}

CRITICAL: the "id" field MUST match one of the candidate ids above exactly. Output one entry per candidate, in the same order. No markdown code fences.`;
}

export async function generateInsights(
  jd: string,
  candidateIds: string[],
): Promise<{
  ok: boolean;
  insights?: CandidateInsight[];
  error?: string;
}> {
  try {
    await requireUserId();

    if (!env.GROQ_API_KEY) {
      return { ok: false, error: "Groq API key not configured" };
    }
    if (!jd.trim()) {
      return { ok: false, error: "Empty JD" };
    }
    if (candidateIds.length === 0 || candidateIds.length > 5) {
      return { ok: false, error: "Provide 1-5 candidate IDs" };
    }

    const rows = await db.talentProfile.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, rawText: true },
    });
    if (rows.length === 0) {
      return { ok: false, error: "No matching candidates" };
    }

    // Preserve order from candidateIds
    const ordered = candidateIds
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is { id: string; rawText: string } => r !== undefined);

    const client = new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [
        { role: "system", content: INSIGHTS_SYSTEM_PROMPT },
        { role: "user", content: buildInsightsUserPrompt(jd, ordered) },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return { ok: false, error: "Empty LLM response" };
    }

    let parsed: { insights?: unknown };
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return { ok: false, error: "Invalid JSON from LLM" };
    }

    if (!Array.isArray(parsed.insights)) {
      return { ok: false, error: "Malformed insights response" };
    }

    const allowedIds = new Set(ordered.map((c) => c.id));
    const valid: CandidateInsight[] = [];
    for (const item of parsed.insights as Array<Record<string, unknown>>) {
      if (
        item &&
        typeof item.id === "string" &&
        allowedIds.has(item.id) &&
        typeof item.pitch === "string" &&
        Array.isArray(item.missingSkills) &&
        Array.isArray(item.concerns)
      ) {
        valid.push({
          id: item.id,
          pitch: item.pitch,
          missingSkills: item.missingSkills.filter(
            (s): s is string => typeof s === "string",
          ),
          concerns: item.concerns.filter(
            (s): s is string => typeof s === "string",
          ),
        });
      }
    }

    return { ok: true, insights: valid };
  } catch (err) {
    logger.error("generateInsights failed", err);
    return { ok: false, error: "Insights generation failed" };
  }
}
