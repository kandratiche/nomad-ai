import type { StructuredSection, ConfidenceLevel } from "../types";
import type { DBPlace } from "./places";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const EMBEDDING_MODEL = "gemini-embedding-001";

const THRESHOLD_VERIFIED = 0.6;
const THRESHOLD_AI_GENERATED = 0.4;

interface EmbeddingResult {
  values: number[];
}

async function batchEmbed(texts: string[]): Promise<number[][]> {
  if (!GEMINI_API_KEY || texts.length === 0) return [];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${GEMINI_API_KEY}`;

  const requests = texts.map(text => ({
    model: `models/${EMBEDDING_MODEL}`,
    content: { parts: [{ text: text.slice(0, 512) }] },
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ requests }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[SemanticValidator] Embedding API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const embeddings: EmbeddingResult[] = data.embeddings || [];
    return embeddings.map(e => e.values || []);
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      console.warn("[SemanticValidator] Embedding API timed out");
    } else {
      console.warn("[SemanticValidator] Embedding API error:", err.message);
    }
    return [];
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function classifyConfidence(score: number): ConfidenceLevel {
  if (score >= THRESHOLD_VERIFIED) return "verified";
  if (score >= THRESHOLD_AI_GENERATED) return "ai_generated";
  return "low_confidence";
}

export interface SemanticScores {
  /** Maps option place ID to { score, level } */
  scores: Map<string, { score: number; level: ConfidenceLevel }>;
}

/**
 * Computes semantic similarity between each AI-generated "why" text
 * and the original DB description for the corresponding place.
 * Returns confidence scores per place ID.
 */
export async function computeSemanticScores(
  sections: StructuredSection[],
  placeMap: Map<string, DBPlace>,
): Promise<SemanticScores> {
  const result: SemanticScores = { scores: new Map() };

  const pairs: { id: string; whyText: string; dbText: string }[] = [];
  for (const section of sections) {
    for (const opt of [...section.options, ...section.reserves]) {
      const dbPlace = placeMap.get(opt.place.id);
      if (!dbPlace) continue;

      const dbText = [
        dbPlace.description || "",
        (dbPlace.tags || []).join(", "),
        dbPlace.type || "",
        dbPlace.title || "",
      ].filter(Boolean).join(". ");

      pairs.push({ id: opt.place.id, whyText: opt.why, dbText });
    }
  }

  if (pairs.length === 0) return result;

  // Interleave: [why0, db0, why1, db1, ...]
  const allTexts = pairs.flatMap(p => [p.whyText, p.dbText]);
  const embeddings = await batchEmbed(allTexts);

  if (embeddings.length < allTexts.length) {
    console.warn(`[SemanticValidator] Got ${embeddings.length}/${allTexts.length} embeddings, skipping scoring`);
    return result;
  }

  for (let i = 0; i < pairs.length; i++) {
    const whyEmb = embeddings[i * 2];
    const dbEmb = embeddings[i * 2 + 1];
    const score = cosineSimilarity(whyEmb, dbEmb);
    const level = classifyConfidence(score);

    result.scores.set(pairs[i].id, { score, level });
    console.log(`[SemanticValidator] ${pairs[i].id.slice(0, 8)}... similarity=${score.toFixed(3)} → ${level}`);
  }

  return result;
}

/**
 * Applies semantic scores to sections, updating confidence fields.
 * For low_confidence items, replaces "why" with the DB description as fallback.
 */
export function applySemanticScores(
  sections: StructuredSection[],
  semanticScores: SemanticScores,
  placeMap: Map<string, DBPlace>,
): void {
  for (const section of sections) {
    for (const opt of [...section.options, ...section.reserves]) {
      const scoreData = semanticScores.scores.get(opt.place.id);
      if (!scoreData) continue;

      opt.confidence = scoreData.score;
      opt.confidenceLevel = scoreData.level;

      if (scoreData.level === "low_confidence") {
        const dbPlace = placeMap.get(opt.place.id);
        if (dbPlace?.description) {
          opt.why = dbPlace.description;
          opt.confidenceLevel = "ai_generated";
          console.log(`[SemanticValidator] Replaced low-confidence "why" for ${opt.place.id.slice(0, 8)}... with DB description`);
        }
      }
    }
  }
}
