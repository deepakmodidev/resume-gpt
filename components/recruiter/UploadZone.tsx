"use client";

import { useCallback, useState } from "react";
import { existingHashes, ingestProfile } from "@/app/actions/talent";
import { parseResume } from "@/app/actions/parse-resume";
import { normalizeForHash } from "@/lib/utils";

const MAX_FILES = 20;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type RowState =
  | { state: "queued" }
  | { state: "extracting" }
  | { state: "embedding" }
  | { state: "ingesting" }
  | { state: "ok" }
  | { state: "duplicate" }
  | { state: "error"; message: string };

type Row = { name: string; size: number; state: RowState };

function isAllowed(file: File): boolean {
  if (ALLOWED_MIME.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".docx");
}

export default function UploadZone({
  embedPassage,
  onChange,
}: {
  embedPassage: (text: string) => Promise<number[]>;
  onChange?: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const setRow = useCallback((index: number, state: RowState) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], state };
      return next;
    });
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const list = Array.from(files).slice(0, MAX_FILES);
      const initial: Row[] = list.map((f) => ({
        name: f.name,
        size: f.size,
        state: { state: "queued" },
      }));
      setRows(initial);
      setBusy(true);

      try {
        for (let i = 0; i < list.length; i++) {
          const file = list[i];

          if (!isAllowed(file)) {
            setRow(i, { state: "error", message: "Unsupported type" });
            continue;
          }
          if (file.size > MAX_BYTES) {
            setRow(i, { state: "error", message: "Too large (>5MB)" });
            continue;
          }

          setRow(i, { state: "extracting" });
          const fd = new FormData();
          fd.append("file", file);
          const { text, error } = await parseResume(fd);
          if (error || !text) {
            setRow(i, {
              state: "error",
              message: error ?? "Could not extract text",
            });
            continue;
          }

          const hash = await sha256Hex(normalizeForHash(text));
          const existing = await existingHashes([hash]);
          if (existing.includes(hash)) {
            setRow(i, { state: "duplicate" });
            continue;
          }

          setRow(i, { state: "embedding" });
          let vector: number[];
          try {
            vector = await embedPassage(text);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setRow(i, { state: "error", message: `Embed failed: ${msg}` });
            continue;
          }

          setRow(i, { state: "ingesting" });
          const res = await ingestProfile(text, vector);
          if (res.ok) {
            setRow(i, { state: "ok" });
          } else {
            setRow(i, { state: "error", message: res.error ?? "Ingest failed" });
          }
        }
      } finally {
        setBusy(false);
        onChange?.();
      }
    },
    [embedPassage, onChange, setRow],
  );

  return (
    <div className="border rounded-lg p-5">
      <h2 className="font-semibold mb-1">Upload resumes</h2>
      <p className="text-xs text-muted-foreground mb-4">
        PDF or DOCX, up to 20 files, 5 MB each. Text is extracted and embedded
        with BGE in your browser.
      </p>

      <label
        className={`border-2 border-dashed rounded-lg p-6 block text-center cursor-pointer transition ${
          busy
            ? "opacity-50 pointer-events-none"
            : "hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
        <p className="text-sm font-medium">Click to choose files</p>
        <p className="text-xs text-muted-foreground mt-1">
          Max 20 files per batch
        </p>
      </label>

      {rows.length > 0 && (
        <ul className="mt-5 space-y-2 text-sm">
          {rows.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-2"
            >
              <span className="truncate font-mono text-xs">{r.name}</span>
              <StateBadge state={r.state} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: RowState }) {
  const map: Record<RowState["state"], { label: string; cls: string }> = {
    queued: { label: "queued", cls: "bg-gray-200 text-gray-700" },
    extracting: { label: "extracting…", cls: "bg-blue-100 text-blue-800" },
    embedding: { label: "embedding…", cls: "bg-indigo-100 text-indigo-800" },
    ingesting: { label: "saving…", cls: "bg-purple-100 text-purple-800" },
    ok: { label: "ingested", cls: "bg-green-100 text-green-800" },
    duplicate: { label: "duplicate", cls: "bg-yellow-100 text-yellow-800" },
    error: { label: "error", cls: "bg-red-100 text-red-800" },
  };
  const cfg = map[state.state];
  const title = state.state === "error" ? state.message : undefined;
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.cls}`}
      title={title}
    >
      {cfg.label}
      {state.state === "error" && ` · ${state.message}`}
    </span>
  );
}
