"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteProfile,
  listAllProfiles,
  listProfiles,
} from "@/app/actions/talent";
import { Button } from "@/components/ui/button";

type Mode = "mine" | "all";

type Row = {
  id: string;
  snippet: string;
  createdAt: string;
  name?: string | null;
  email?: string | null;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function PoolPanel({
  refreshKey,
  onChange,
}: {
  refreshKey: number;
  onChange?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("mine");
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        mode === "all" ? await listAllProfiles() : await listProfiles();
      setItems(data);
    } catch (err) {
      console.error("loadProfiles failed:", err);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    setExpanded(new Set());
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    setExpanded(new Set());
  }, [mode]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this candidate from the pool?")) return;
      setDeletingId(id);
      try {
        const res = await deleteProfile(id);
        if (res.ok) {
          setItems((prev) => prev.filter((p) => p.id !== id));
          onChange?.();
        } else {
          alert(res.error ?? "Delete failed");
        }
      } finally {
        setDeletingId(null);
      }
    },
    [onChange],
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="border rounded-lg p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">
          {mode === "all" ? "All candidates" : "Your resumes in the pool"}{" "}
          <span className="text-muted-foreground font-normal">
            ({items.length})
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border overflow-hidden text-xs">
            <button
              onClick={() => setMode("mine")}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${
                mode === "mine"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              My resumes
            </button>
            <button
              onClick={() => setMode("all")}
              className={`px-2.5 py-1 cursor-pointer transition-colors border-l ${
                mode === "all"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All candidates
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={loading}
            className="text-xs text-muted-foreground"
          >
            {loading ? "loading…" : "↻ refresh"}
          </Button>
        </div>
      </div>

      {!loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {mode === "all"
            ? "The shared pool is empty."
            : "No candidates yet. Upload resumes above to build your pool."}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => {
            const isExpanded = expanded.has(p.id);
            const isDeleting = deletingId === p.id;
            return (
              <li
                key={p.id}
                className="flex items-start justify-between gap-3 border-b last:border-b-0 pb-3"
              >
                <div className="flex-1 min-w-0">
                  {mode === "all" && (p.name || p.email) && (
                    <p className="text-sm font-medium mb-0.5">
                      {p.name || "Unnamed candidate"}
                      {p.email && (
                        <a
                          href={`mailto:${p.email}`}
                          className="ml-2 text-xs font-normal text-blue-600 hover:underline"
                        >
                          {p.email}
                        </a>
                      )}
                    </p>
                  )}
                  <p
                    className={`text-sm whitespace-pre-wrap ${
                      isExpanded
                        ? "max-h-96 overflow-y-auto pr-2"
                        : "line-clamp-2"
                    }`}
                  >
                    {p.snippet}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatWhen(p.createdAt)}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => toggleExpanded(p.id)}
                      className="text-xs h-auto p-0 text-blue-600"
                    >
                      {isExpanded ? "less" : "more"}
                    </Button>
                  </div>
                </div>
                {mode === "mine" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={isDeleting}
                    className="text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 whitespace-nowrap"
                  >
                    {isDeleting ? "…" : "Delete"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
