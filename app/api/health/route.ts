import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import db from "@/prisma/prisma";
import { logger } from "@/lib/logger";
import { AI_MODELS } from "@/lib/constants";

interface HealthStatus {
  status: "up" | "down" | "degraded";
  message?: string;
  latency?: number;
}

interface AppHealth {
  status: "up" | "down" | "degraded";
  timestamp: string;
  database: HealthStatus;
  groq: HealthStatus;
}

async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return {
      status: "up",
      latency: Date.now() - start,
    };
  } catch (error) {
    logger.error("Database health check failed:", error);
    return {
      status: "down",
      message: "Database connection failed",
    };
  }
}

async function checkGroq(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        status: "degraded",
        message: "GROQ_API_KEY environment variable is missing",
      };
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Just list models as a lightweight check
    await client.models.list();

    return {
      status: "up",
      latency: Date.now() - start,
    };
  } catch (error) {
    logger.error("Groq health check failed:", error);
    return {
      status: "down",
      message: error instanceof Error ? error.message : "Groq API unreachable",
    };
  }
}

export async function GET() {
  const [databaseHealth, groqHealth] = await Promise.all([
    checkDatabase(),
    checkGroq(),
  ]);

  const overallStatus =
    databaseHealth.status === "up" && groqHealth.status === "up"
      ? "up"
      : databaseHealth.status === "down" || groqHealth.status === "down"
        ? "down"
        : "degraded";

  const health: AppHealth = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    database: databaseHealth,
    groq: groqHealth,
  };

  return NextResponse.json(health, {
    status: overallStatus === "down" ? 503 : 200,
  });
}
