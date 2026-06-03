/// <reference lib="webworker" />
import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "Xenova/bge-small-en-v1.5";
const QUERY_PREFIX =
  "Represent this sentence for searching relevant passages: ";

type Req =
  | { id: string; kind: "PASSAGE"; text: string }
  | { id: string; kind: "QUERY"; text: string };

type Res =
  | { id: string; ok: true; vector: number[] }
  | { id: string; ok: false; error: string }
  | { kind: "PROGRESS"; loaded: number; total: number };

let extractor: any = null;

async function getExtractor() {
  if (extractor) return extractor;
  extractor = await pipeline("feature-extraction", MODEL_ID, {
    progress_callback: (p: any) => {
      if (p.status === "progress") {
        const msg: Res = {
          kind: "PROGRESS",
          loaded: p.loaded ?? 0,
          total: p.total ?? 0,
        };
        self.postMessage(msg);
      }
    },
  });
  return extractor;
}

self.onmessage = async (e: MessageEvent<Req>) => {
  const req = e.data;
  try {
    const pipe = await getExtractor();
    const input = req.kind === "QUERY" ? QUERY_PREFIX + req.text : req.text;
    const output = await pipe(input, { pooling: "mean", normalize: true });
    const vector = Array.from(output.data as Float32Array);
    const res: Res = { id: req.id, ok: true, vector };
    self.postMessage(res);
  } catch (err: any) {
    const res: Res = {
      id: req.id,
      ok: false,
      error: err?.message ?? "embed failed",
    };
    self.postMessage(res);
  }
};

export {};
