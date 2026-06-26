import type OpenAI from "openai";
import { AI_MODELS } from "@/lib/constants";
import { logger } from "@/lib/logger";

type GroqCompletionParams = Omit<
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  "model"
>;

/**
 * Run a Groq chat completion on the primary model, automatically retrying with
 * the fallback model if the primary fails (rate limit, outage, decommission).
 */
export async function createGroqCompletion(
  client: OpenAI,
  params: GroqCompletionParams,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  try {
    return await client.chat.completions.create({
      ...params,
      model: AI_MODELS.GROQ_PRIMARY,
    });
  } catch (error) {
    logger.warn(
      `Groq primary model (${AI_MODELS.GROQ_PRIMARY}) failed; retrying with fallback (${AI_MODELS.GROQ_FALLBACK})`,
      error,
    );
    return await client.chat.completions.create({
      ...params,
      model: AI_MODELS.GROQ_FALLBACK,
    });
  }
}
