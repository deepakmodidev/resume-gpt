"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteProfile,
  listProfiles,
  type PoolProfile,
} from "@/app/actions/talent";

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
  const [items, setItems] = useState<PoolProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProfiles();
      setItems(data);
    } catch (err) {
      console.error("listProfiles failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

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
          Candidates in pool{" "}
          <span className="text-muted-foreground font-normal">
            ({items.length})
          </span>
        </h2>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {loading ? "loading…" : "↻ refresh"}
        </button>
      </div>

      {!loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No candidates yet. Upload resumes above to build your pool.
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
                    <button
                      onClick={() => toggleExpanded(p.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {isExpanded ? "less" : "more"}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={isDeleting}
                  className="text-xs px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50 whitespace-nowrap"
                >
                  {isDeleting ? "…" : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
