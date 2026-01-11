import { NextResponse } from "next/server";
import db from "@/prisma/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// Types
interface HealthStatus {
  status: "ok" | "error";
  message?: string;
}

interface HealthCheck {
  backend: HealthStatus;
  database: HealthStatus;
  gemini: HealthStatus;
  prisma: HealthStatus;
  env: HealthStatus;
  uptime: HealthStatus;
  timestamp: HealthStatus;
  status: HealthStatus;
}

const createHealthStatus = (
  status: "ok" | "error",
  message?: string
): HealthStatus => ({
  status,
  ...(message && { message }),
});

const checkDatabase = async (): Promise<HealthStatus> => {
  try {
    await db.user.findFirst({ select: { id: true } });
    return createHealthStatus("ok");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DB connection failed";
    return createHealthStatus("error", message);
  }
};

const checkGemini = async (): Promise<HealthStatus> => {
  try {
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey?.startsWith("AIza")) {
      throw new Error("Missing or invalid Gemini API key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    await model.generateContent("ping");

    return createHealthStatus("ok");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini API failed";
    return createHealthStatus("error", message);
  }
};

const checkEnvironment = (): HealthStatus => {
  const requiredEnv = [
    "DATABASE_URL",
    "GEMINI_KEY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
  ];

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      return createHealthStatus("error", `Missing env: ${key}`);
    }
  }

  return createHealthStatus("ok");
};

export async function GET() {
  const [databaseHealth, geminiHealth] = await Promise.all([
    checkDatabase(),
    checkGemini(),
  ]);

  const health: HealthCheck = {
    backend: createHealthStatus("ok"),
    database: databaseHealth,
    gemini: geminiHealth,
    prisma: databaseHealth, // Same as database check
    env: checkEnvironment(),
    uptime: createHealthStatus("ok", `${Math.floor(process.uptime?.() || 0)}s`),
    timestamp: createHealthStatus("ok", new Date().toISOString()),
    status: createHealthStatus("ok"), // Will be updated below
  };

  // Determine overall status
  const allOk = Object.entries(health)
    .filter(([key]) => key !== "status") // Exclude status itself
    .every(([, value]) => value.status === "ok");

  health.status = createHealthStatus(allOk ? "ok" : "error");

  return NextResponse.json(health, { status: allOk ? 200 : 500 });
}
