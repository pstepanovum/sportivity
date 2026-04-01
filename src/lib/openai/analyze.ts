// FILE: src/lib/openai/analyze.ts
import type { AnalysisFeedback, Exercise, JointAngles } from "@/types/analysis";
import { debugError, debugLog, summarizeAngles, summarizeFrames } from "@/lib/debug";
import { clampScore } from "@/lib/utils";

const EXERCISE_CUES: Record<Exercise, string> = {
  squat:
    "Key form points: knees track over toes, chest up, depth below parallel, neutral spine, heels down.",
  deadlift:
    "Key form points: hips hinge back, neutral spine, bar close to body, shoulders over bar, no rounding.",
  pushup:
    "Key form points: straight body line, elbows 45 degrees from body, chest to floor, no hip sag or piking.",
};

function normalizeFeedback(raw: Partial<AnalysisFeedback>): AnalysisFeedback {
  return {
    overall: raw.overall?.slice(0, 140) ?? "Solid effort with room for cleaner mechanics.",
    score: clampScore(raw.score ?? 0),
    correct: Array.isArray(raw.correct) ? raw.correct.slice(0, 3).map((item) => item.slice(0, 80)) : [],
    errors: Array.isArray(raw.errors)
      ? raw.errors.slice(0, 4).map((item) => ({
          joint: item.joint?.slice(0, 40) ?? "form",
          issue: item.issue?.slice(0, 80) ?? "Needs closer review.",
          cue: item.cue?.slice(0, 80) ?? "Slow down and reset your position.",
        }))
      : [],
    summary_cue:
      raw.summary_cue?.slice(0, 120) ?? "Focus on staying controlled and repeat the rep with intent.",
  };
}

export async function analyzeForm(
  frames: string[],
  exercise: Exercise,
  angles?: JointAngles,
  requestId?: string,
): Promise<AnalysisFeedback> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  debugLog("openai/analyze", "Preparing OpenAI form analysis request", {
    requestId: requestId ?? null,
    exercise,
    frames: summarizeFrames(frames),
    angles: summarizeAngles(angles),
  });

  const angleText = angles ? `Measured joint angles: ${JSON.stringify(angles, null, 2)}` : "No joint angles provided.";

  const imageContent = frames.map((frame) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:image/jpeg;base64,${frame}`,
      detail: "high" as const,
    },
  }));

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 1000,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `You are an expert strength and conditioning coach analyzing exercise form from video frames.
${EXERCISE_CUES[exercise]}
${angleText}

Respond only with a JSON object matching this schema:
{
  "overall": "one sentence overall assessment",
  "score": <integer 0-100>,
  "correct": ["what they are doing well 1", "what they are doing well 2"],
  "errors": [
    { "joint": "body part name", "issue": "what is wrong", "cue": "corrective instruction" }
  ],
  "summary_cue": "the single most important correction"
}

Score guide:
90-100 = near perfect
70-89 = good with minor fixes
50-69 = significant issues
below 50 = major form breakdown

Be specific, honest, and actionable. Keep each string under 80 characters.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze my ${exercise} form from these ${frames.length} frames. Give detailed but concise coaching.`,
            },
            ...imageContent,
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    debugError("openai/analyze", "OpenAI responded with a non-200 status", details, {
      requestId: requestId ?? null,
      status: response.status,
    });
    throw new Error(`OpenAI error: ${response.status} ${details}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? "{}";
  const clean = content.replace(/```json|```/g, "").trim();
  debugLog("openai/analyze", "OpenAI raw content received", {
    requestId: requestId ?? null,
    content,
  });

  const normalized = normalizeFeedback(JSON.parse(clean) as Partial<AnalysisFeedback>);
  debugLog("openai/analyze", "OpenAI feedback normalized", {
    requestId: requestId ?? null,
    feedback: normalized,
  });

  return normalized;
}
