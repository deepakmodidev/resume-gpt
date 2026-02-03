// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Client-side API request helper
 * Replaces ~600 lines of duplicate fetch code across components
 *
 * @example
 * const data = await apiRequest("/api/chat", {
 *   method: "POST",
 *   body: JSON.stringify({ message: "Hello" })
 * });
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit & { timeout?: number },
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options?.timeout || 30000, // 30 second default timeout
  );

  try {
    const apiKey = localStorage.getItem("gemini-api-key");
    const headers = {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
      ...options?.headers,
    };

    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.error || `Request failed with status ${response.status}`,
        response.status,
        error.code,
      );
    }

    return response.json();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new APIError("Request timeout", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
