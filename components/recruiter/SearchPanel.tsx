"use client";

import { useState } from "react";
import {
  generateInsights,
  searchTalent,
  type CandidateInsight,
  type SearchResult,
} from "@/app/actions/talent";

const MIN_JD_LENGTH = 50;
const STRONG_THRESHOLD = 70;
const MODERATE_THRESHOLD = 50;
const INSIGHTS_TOP_K = 3;

export default function SearchPanel({
  embedQuery,
}: {
  embedQuery: (text: string) => Promise<number[]>;
}) {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [insights, setInsights] = useState<Record<string, CandidateInsight>>(
    {},
  );
  const [insightsBusy, setInsightsBusy] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const trimmedLen = jd.trim().length;
  const tooShort = trimmedLen > 0 && trimmedLen < MIN_JD_LENGTH;
  const canSearch = !busy && trimmedLen >= MIN_JD_LENGTH;

  async function run() {
    if (!canSearch) return;
    setBusy(true);
    setError(null);
    setHasSearched(true);
    setInsights({});
    setInsightsError(null);
    try {
      const vec = await embedQuery(jd);
      const rows = await searchTalent(vec);
      setResults(rows);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  async function runInsights() {
    const topK = results.slice(0, INSIGHTS_TOP_K);
    if (topK.length === 0) return;
    setInsightsBusy(true);
    setInsightsError(null);
    try {
      const res = await generateInsights(
        jd,
        topK.map((r) => r.id),
      );
      if (res.ok && res.insights) {
        const map: Record<string, CandidateInsight> = {};
        for (const ins of res.insights) map[ins.id] = ins;
        setInsights(map);
      } else {
        setInsightsError(res.error ?? "Failed to generate insights");
      }
    } catch (e: unknown) {
      setInsightsError(e instanceof Error ? e.message : String(e));
    } finally {
      setInsightsBusy(false);
    }
  }

  const hasAnyStrongMatch = results.some((r) => r.score >= MODERATE_THRESHOLD);
  const hasInsights = Object.keys(insights).length > 0;

  return (
    <div className="border rounded-lg p-5">
      <h2 className="font-semibold mb-1">Search candidates</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Paste a job description. The JD is embedded in your browser and ranked
        against the candidate pool via cosine similarity.
      </p>

      <textarea
        className="w-full border rounded p-3 min-h-[160px] text-sm font-mono"
        placeholder="Paste the job description here…"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        disabled={busy}
      />

      {tooShort && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          Add at least {MIN_JD_LENGTH - trimmedLen} more character
          {MIN_JD_LENGTH - trimmedLen === 1 ? "" : "s"} — semantic search needs
          a real sentence describing the role, not a fragment.
        </p>
      )}

      <button
        onClick={run}
        disabled={!canSearch}
        className="mt-3 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Searching…" : "Find candidates"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {hasSearched && !busy && !error && results.length === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">
          No candidates yet — upload some resumes first.
        </p>
      )}

      {results.length > 0 && (
        <>
          {!hasAnyStrongMatch && (
            <p className="mt-5 text-xs text-amber-600 dark:text-amber-400">
              No strong matches in your pool for this JD. Showing the closest
              candidates below, but treat the rankings as low confidence.
            </p>
          )}
          <div className="mt-3 mb-3 flex items-center gap-3">
            <button
              onClick={runInsights}
              disabled={insightsBusy || results.length === 0}
              className="px-3 py-1.5 rounded border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-50 dark:hover:bg-purple-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {insightsBusy
                ? "Generating AI insights…"
                : hasInsights
                  ? "↻ Regenerate AI insights"
                  : `✨ Generate AI insights (top ${Math.min(results.length, INSIGHTS_TOP_K)})`}
            </button>
            {hasInsights && (
              <span className="text-[10px] text-muted-foreground">
                via Groq Llama 3.3 — RAG over retrieved candidates
              </span>
            )}
          </div>

          {insightsError && (
            <p className="mb-3 text-xs text-red-600 dark:text-red-400">
              {insightsError}
            </p>
          )}

          <ul className="space-y-3">
            {results.map((r, i) => {
              const strong = r.score >= STRONG_THRESHOLD;
              const moderate =
                r.score >= MODERATE_THRESHOLD && r.score < STRONG_THRESHOLD;
              const weak = r.score < MODERATE_THRESHOLD;
              const insight = insights[r.id];
              return (
                <li key={r.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <span className="text-xs font-mono text-muted-foreground mr-2">
                        #{i + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {r.name || "Unnamed candidate"}
                      </span>
                      {r.email && (
                        <a
                          href={`mailto:${r.email}`}
                          className="ml-2 text-xs text-blue-600 hover:underline"
                        >
                          {r.email}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {weak && (
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-muted-foreground">
                          low confidence
                        </span>
                      )}
                      <span
                        className={`text-sm font-bold ${
                          strong
                            ? "text-green-600 dark:text-green-400"
                            : moderate
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {r.score}% match
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {r.snippet}…
                  </p>

                  {insight && (
                    <div className="mt-3 pt-3 border-t border-dashed">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold">
                          AI Pitch
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {insight.pitch}
                      </p>

                      {insight.missingSkills.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                            Missing skills
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {insight.missingSkills.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {insight.concerns.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                            Concerns
                          </p>
                          <ul className="text-xs text-foreground/80 list-disc list-inside space-y-0.5">
                            {insight.concerns.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
