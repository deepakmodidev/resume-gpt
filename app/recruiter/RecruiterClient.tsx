"use client";

import { useCallback, useEffect, useState } from "react";
import {
  embedPassage,
  embedQuery,
  onWorkerProgress,
} from "@/lib/ai/worker-client";
import UploadZone from "@/components/recruiter/UploadZone";
import SearchPanel from "@/components/recruiter/SearchPanel";
import PoolPanel from "@/components/recruiter/PoolPanel";

type Progress = { loaded: number; total: number };

export default function RecruiterClient({
  initialCount,
}: {
  initialCount: number;
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [poolVersion, setPoolVersion] = useState(0);

  useEffect(() => {
    onWorkerProgress((loaded, total) => {
      setProgress({ loaded, total });
    });
    // Warm the worker with a tiny embed. When it resolves, model is loaded.
    embedPassage("warmup")
      .then(() => setReady(true))
      .catch((e) => {
        console.error("Worker warmup failed:", e);
        setReady(true); // unblock UI even if first call errored
      });
  }, []);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/recruiter/api/count", { cache: "no-store" });
      if (res.ok) {
        const { count: c } = await res.json();
        setCount(c);
      }
    } catch {
      // ignore — not critical
    }
    setPoolVersion((v) => v + 1);
  }, []);

  if (!ready) {
    const pct =
      progress && progress.total > 0
        ? Math.round((progress.loaded / progress.total) * 100)
        : 0;
    return (
      <div className="max-w-md mx-auto p-12 text-center">
        <h2 className="text-2xl font-semibold mb-3">Loading AI engine</h2>
        <p className="text-sm text-muted-foreground mb-6">
          One-time ~34 MB download of <code>bge-small-en-v1.5</code> (quantized
          ONNX). Cached in your browser after this.
        </p>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {pct}%
          {progress && progress.total > 0 && (
            <span className="ml-2">
              ({Math.round(progress.loaded / 1024 / 1024)} MB /{" "}
              {Math.round(progress.total / 1024 / 1024)} MB)
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruiter Matchmaker</h1>
          <p className="text-sm text-muted-foreground">
            Semantic candidate search powered by client-side embeddings (BGE) and
            pgvector.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Pool: <span className="font-semibold text-foreground">{count}</span>{" "}
          candidates
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadZone embedPassage={embedPassage} onChange={refreshCount} />
        <SearchPanel embedQuery={embedQuery} />
      </div>

      <PoolPanel refreshKey={poolVersion} onChange={refreshCount} />
    </div>
  );
}
