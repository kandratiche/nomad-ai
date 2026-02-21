import type { StructuredSection } from "../types";
import type { DBPlace } from "./places";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const JUDGE_MODEL = "gemini-2.5-flash-lite";
const JUDGE_TIMEOUT_MS = 3000;

export interface JudgeIssue {
  optionId: string;
  type: "logical_contradiction" | "temporal_impossibility" | "geographic_error" | "fabricated_detail";
  description: string;
}

export interface JudgeResult {
  valid: boolean;
  issues: JudgeIssue[];
}

/**
 * Uses a fast, independent LLM to fact-check the main model's response
 * against the original DB context. Returns issues found, if any.
 * Gracefully degrades on timeout/error — returns valid=true with no issues.
 */
export async function judgeResponse(
  sections: StructuredSection[],
  placeMap: Map<string, DBPlace>,
  city: string,
): Promise<JudgeResult> {
  if (!GEMINI_API_KEY) {
    return { valid: true, issues: [] };
  }

  const context = Array.from(placeMap.values()).map(p => ({
    id: p.id,
    title: p.title,
    type: p.type,
    tags: p.tags,
    desc: (p.description || "").slice(0, 80),
    price: p.price_level,
    addr: p.address || "",
  }));

  const aiResponse = sections.map(s => ({
    title: s.title,
    timeRange: s.timeRange,
    options: s.options.map(o => ({
      id: o.place.id,
      title: o.place.title,
      why: o.why,
      budget: o.budgetHint,
    })),
  }));

  const prompt = `You are a strict fact-checker for a travel app in ${city}, Kazakhstan.

ORIGINAL DATABASE CONTEXT (source of truth):
${JSON.stringify(context)}

AI-GENERATED RESPONSE to verify:
${JSON.stringify(aiResponse)}

Check the AI response for:
1. Logical contradictions (e.g. "quiet nightclub", "budget luxury restaurant")
2. Temporal impossibilities (e.g. breakfast recommended at 23:00, lunch at 06:00)
3. Geographic errors (places mixed from different cities)
4. Fabricated details — any claim in "why" that cannot be verified from the database context (invented features, fake prices, non-existent amenities)

Return ONLY valid JSON:
{"valid":true/false,"issues":[{"optionId":"place-uuid","type":"logical_contradiction|temporal_impossibility|geographic_error|fabricated_detail","description":"brief explanation"}]}

If everything checks out, return: {"valid":true,"issues":[]}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${JUDGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), JUDGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[LLMJudge] API error: ${response.status}`);
      return { valid: true, issues: [] };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      console.warn("[LLMJudge] Empty response");
      return { valid: true, issues: [] };
    }

    const cleaned = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned) as JudgeResult;

    if (!Array.isArray(result.issues)) {
      result.issues = [];
    }

    const issueCount = result.issues.length;
    console.log(`[LLMJudge] Verdict: ${result.valid ? "PASS" : "ISSUES FOUND"} (${issueCount} issue${issueCount !== 1 ? "s" : ""})`);

    for (const issue of result.issues) {
      console.log(`[LLMJudge]   ${issue.type}: ${issue.description} (${issue.optionId?.slice(0, 8)}...)`);
    }

    return result;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      console.warn(`[LLMJudge] Timed out after ${JUDGE_TIMEOUT_MS}ms — skipping check`);
    } else if (err instanceof SyntaxError) {
      console.warn("[LLMJudge] Failed to parse response JSON — skipping check");
    } else {
      console.warn("[LLMJudge] Error:", err.message);
    }
    return { valid: true, issues: [] };
  }
}

/**
 * Applies judge issues to sections by downgrading confidence
 * for flagged options.
 */
export function applyJudgeResults(
  sections: StructuredSection[],
  judgeResult: JudgeResult,
): void {
  if (judgeResult.valid || judgeResult.issues.length === 0) return;

  const issueMap = new Map<string, JudgeIssue[]>();
  for (const issue of judgeResult.issues) {
    const existing = issueMap.get(issue.optionId) || [];
    existing.push(issue);
    issueMap.set(issue.optionId, existing);
  }

  for (const section of sections) {
    for (const opt of section.options) {
      const issues = issueMap.get(opt.place.id);
      if (!issues || issues.length === 0) continue;

      const hasFabrication = issues.some(i => i.type === "fabricated_detail");
      const hasLogical = issues.some(i => i.type === "logical_contradiction" || i.type === "temporal_impossibility");

      if (hasFabrication || hasLogical) {
        opt.confidence = Math.min(opt.confidence, 0.4);
        opt.confidenceLevel = "low_confidence";
      } else {
        opt.confidence = Math.min(opt.confidence, 0.55);
        if (opt.confidenceLevel === "verified") {
          opt.confidenceLevel = "ai_generated";
        }
      }
    }
  }
}
