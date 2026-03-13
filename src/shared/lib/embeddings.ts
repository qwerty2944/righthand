import type { FeatureExtractionPipeline } from "@huggingface/transformers";

let _extractor: Promise<FeatureExtractionPipeline> | null = null;

async function createPipeline(): Promise<FeatureExtractionPipeline> {
  const { pipeline } = await import("@huggingface/transformers");
  // @ts-expect-error -- pipeline() overload union too complex for TS
  return pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
    dtype: "fp32",
  });
}

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!_extractor) {
    _extractor = createPipeline();
  }
  return _extractor;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return output.tolist()[0] as number[];
}

export function buildEmbeddingText(fields: Record<string, string | null | undefined>): string {
  return Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
