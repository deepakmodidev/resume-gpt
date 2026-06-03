"use client";

type ProgressCb = (loaded: number, total: number) => void;

type Pending = {
  resolve: (v: number[]) => void;
  reject: (e: Error) => void;
};

let worker: Worker | null = null;
let progressCb: ProgressCb | null = null;
const pending = new Map<string, Pending>();

function failAllPending(reason: string) {
  for (const [, slot] of pending) slot.reject(new Error(reason));
  pending.clear();
}

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./embedding.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (e: MessageEvent) => {
    const msg = e.data;
    if (msg?.kind === "PROGRESS") {
      progressCb?.(msg.loaded, msg.total);
      return;
    }
    const slot = pending.get(msg.id);
    if (!slot) return;
    pending.delete(msg.id);
    if (msg.ok) slot.resolve(msg.vector);
    else slot.reject(new Error(msg.error));
  };
  worker.onerror = (e: ErrorEvent) => {
    const reason = `worker.onerror: ${e.message ?? "unknown"} @ ${e.filename ?? "?"}:${e.lineno ?? "?"}`;
    console.error("[worker-client]", reason, e);
    failAllPending(reason);
  };
  worker.onmessageerror = (e) => {
    console.error("[worker-client] messageerror", e);
    failAllPending("worker message deserialization failed");
  };
  return worker;
}

export function onWorkerProgress(cb: ProgressCb) {
  progressCb = cb;
}

function embed(kind: "PASSAGE" | "QUERY", text: string): Promise<number[]> {
  const w = ensureWorker();
  const id = crypto.randomUUID();
  return new Promise<number[]>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, kind, text });
  });
}

export const embedPassage = (text: string) => embed("PASSAGE", text);
export const embedQuery = (text: string) => embed("QUERY", text);
