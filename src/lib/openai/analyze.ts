// FILE: src/lib/openai/analyze.ts
import type { AnalysisFeedback, Exercise, JointAngles, PoseMotionSummary } from "@/types/analysis";
import { debugError, debugLog, summarizeAngles, summarizeFrames, summarizePoseMotion } from "@/lib/debug";
import { clampScore } from "@/lib/utils";

const EXERCISE_CUES: Record<Exercise, string> = {
  squat:
    "Key form points: knees track over toes, chest up, depth below parallel, neutral spine, heels down.",
  deadlift:
    "Key form points: hips hinge back, neutral spine, bar close to body, shoulders over bar, no rounding.",
  pushup:
    "Key form points: straight body line, elbows 45 degrees from body, chest to floor, no hip sag or piking.",
};

function sanitizeViewerLanguage(text: string) {
  return text
    .replace(/provide images of/gi, "upload a clearer video of")
    .replace(/images/gi, "video clips")
    .replace(/image/gi, "video clip")
    .replace(/frames/gi, "video")
    .replace(/frame/gi, "video");
}

function normalizeFeedback(raw: Partial<AnalysisFeedback>): AnalysisFeedback {
  return {
    overall: sanitizeViewerLanguage(raw.overall?.slice(0, 140) ?? "Solid effort with room for cleaner mechanics."),
    score: clampScore(raw.score ?? 0),
    correct: Array.isArray(raw.correct)
      ? raw.correct.slice(0, 3).map((item) => sanitizeViewerLanguage(item.slice(0, 80)))
      : [],
    errors: Array.isArray(raw.errors)
      ? raw.errors.slice(0, 4).map((item) => ({
          joint: sanitizeViewerLanguage(item.joint?.slice(0, 40) ?? "form"),
          issue: sanitizeViewerLanguage(item.issue?.slice(0, 80) ?? "Needs closer review."),
          cue: sanitizeViewerLanguage(item.cue?.slice(0, 80) ?? "Slow down and reset your position."),
        }))
      : [],
    summary_cue: sanitizeViewerLanguage(
      raw.summary_cue?.slice(0, 120) ?? "Focus on staying controlled and repeat the rep with intent.",
    ),
  };
}

type ExerciseMatch = "clear" | "unclear" | "mismatch";

interface ModelAnalysisResponse extends Partial<AnalysisFeedback> {
  exercise_confidence?: number;
  exercise_match?: ExerciseMatch;
  mismatch_reason?: string;
}

interface MovementGuardResult {
  cue: string;
  issue: string;
  overall: string;
  reason: string;
  scoreCap: number;
  status: ExerciseMatch;
}

function maxValue(...values: Array<number | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return valid.length > 0 ? Math.max(...valid) : undefined;
}

function minValue(...values: Array<number | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return valid.length > 0 ? Math.min(...valid) : undefined;
}

function evaluateMovementGuard(exercise: Exercise, poseSummary?: PoseMotionSummary): MovementGuardResult | null {
  if (!poseSummary) {
    return null;
  }

  if (poseSummary.poseCoverage < 0.5 || poseSummary.framesWithPose < 3) {
    return {
      cue: "Record one full side-view rep with your whole body visible.",
      issue: "Pose tracking could not follow enough of your body to judge the movement confidently.",
      overall: `This clip does not show a clear enough ${exercise} rep to score it confidently.`,
      reason: "Pose coverage was too low for a reliable form score.",
      scoreCap: 40,
      status: "unclear",
    };
  }

  const ranges = poseSummary.ranges ?? {};
  const mins = poseSummary.mins ?? {};

  const kneeRange = maxValue(ranges.leftKnee, ranges.rightKnee) ?? 0;
  const hipRange = maxValue(ranges.leftHip, ranges.rightHip) ?? 0;
  const elbowRange = maxValue(ranges.leftElbow, ranges.rightElbow) ?? 0;
  const spineRange = ranges.spine ?? 0;
  const minKnee = minValue(mins.leftKnee, mins.rightKnee) ?? 180;
  const minHip = minValue(mins.leftHip, mins.rightHip) ?? 180;
  const minElbow = minValue(mins.leftElbow, mins.rightElbow) ?? 180;

  if (exercise === "squat") {
    if (kneeRange < 10 && hipRange < 10) {
      return {
        cue: "Show one clear squat rep with visible knee and hip bend from the side.",
        issue: "The clip shows very little squat motion, so it looks more like standing or unrelated arm movement.",
        overall: "This video does not clearly show a squat rep yet, so the score should stay low.",
        reason: "Lower-body joint motion was too small to count as a squat.",
        scoreCap: elbowRange > 20 ? 25 : 35,
        status: "mismatch",
      };
    }

    if (minKnee > 155 && minHip > 150) {
      return {
        cue: "Sink into one visible squat rep before judging finer technique details.",
        issue: "The sampled motion never reaches enough knee or hip bend to read as a real squat rep.",
        overall: "This clip only shows a partial squat pattern, so the score should be conservative.",
        reason: "The squat never reached enough flexion for a reliable review.",
        scoreCap: 45,
        status: "unclear",
      };
    }
  }

  if (exercise === "deadlift") {
    if (hipRange < 12 && kneeRange < 12) {
      return {
        cue: "Record one clear hinge from the side so the hip pattern is easy to read.",
        issue: "The clip does not show enough hinge motion to confirm a deadlift rep.",
        overall: "This video does not clearly show a deadlift rep, so the score should stay low.",
        reason: "Hip and knee movement were too small to validate a deadlift.",
        scoreCap: 35,
        status: "mismatch",
      };
    }

    if (hipRange < 18 || minHip > 145) {
      return {
        cue: "Make the hinge deeper and keep one full rep visible in the clip.",
        issue: "The hinge pattern is too shallow to judge deadlift mechanics with confidence.",
        overall: "This clip only shows a partial deadlift pattern, so the score should be conservative.",
        reason: "The deadlift hinge was too small for a strong form read.",
        scoreCap: 50,
        status: "unclear",
      };
    }
  }

  if (exercise === "pushup") {
    if (elbowRange < 12 && hipRange < 10) {
      return {
        cue: "Show one full push-up rep with visible elbow bend and a full body side view.",
        issue: "The clip does not show enough elbow or body motion to confirm a push-up rep.",
        overall: "This video does not clearly show a push-up rep, so the score should stay low.",
        reason: "Upper-body motion was too small to validate a push-up.",
        scoreCap: 35,
        status: "mismatch",
      };
    }

    if (minElbow > 135 || elbowRange < 20) {
      return {
        cue: "Lower through one fuller push-up rep before judging smaller form details.",
        issue: "The clip never reaches enough elbow bend to read as a full push-up rep.",
        overall: "This clip only shows a partial push-up pattern, so the score should be conservative.",
        reason: "The push-up depth looked too shallow for a confident score.",
        scoreCap: 50,
        status: "unclear",
      };
    }
  }

  if (spineRange > 55 && exercise !== "pushup") {
    return {
      cue: "Film from the side with your whole body steady in frame.",
      issue: "The body position changes too wildly across the clip to trust a clean movement read.",
      overall: `This ${exercise} clip is too noisy to score confidently from the sampled moments.`,
      reason: "Spine angle changed too erratically for a reliable analysis.",
      scoreCap: 55,
      status: "unclear",
    };
  }

  return null;
}

function applyMovementGuard(
  feedback: AnalysisFeedback,
  exercise: Exercise,
  guard: MovementGuardResult | null,
  model: ModelAnalysisResponse,
) {
  const modelStatus = model.exercise_match;
  const modelReason = model.mismatch_reason?.trim();

  let scoreCap = 100;
  let status: ExerciseMatch = "clear";
  const reasons: string[] = [];

  if (guard) {
    scoreCap = Math.min(scoreCap, guard.scoreCap);
    status = guard.status;
    reasons.push(guard.reason);
  }

  if (modelStatus === "unclear") {
    scoreCap = Math.min(scoreCap, 55);
    status = status === "mismatch" ? "mismatch" : "unclear";
  }

  if (modelStatus === "mismatch") {
    scoreCap = Math.min(scoreCap, 35);
    status = "mismatch";
  }

  if (modelReason) {
    reasons.push(modelReason);
  }

  if (status === "clear" && feedback.score <= scoreCap) {
    return feedback;
  }

  const baseIssue =
    guard?.issue ??
    (status === "mismatch"
      ? `The video does not clearly show a valid ${exercise} rep from start to finish.`
      : `The video only shows part of the ${exercise} pattern, so confidence is low.`);
  const baseCue =
    guard?.cue ??
    `Record one clear side-view ${exercise} rep with your whole body visible before judging finer technique.`;
  const baseOverall =
    guard?.overall ??
    (status === "mismatch"
      ? `This clip does not clearly show a real ${exercise} rep, so the score is based on movement clarity instead of form quality.`
      : `This clip shows some ${exercise} motion, but not enough to judge the rep confidently.`);

  return {
    overall: baseOverall,
    score: clampScore(Math.min(feedback.score, scoreCap)),
    correct: feedback.correct.slice(0, status === "mismatch" ? 0 : 1),
    errors: [
      {
        joint: "movement pattern",
        issue: sanitizeViewerLanguage(baseIssue),
        cue: sanitizeViewerLanguage(baseCue),
      },
      ...feedback.errors.slice(0, status === "mismatch" ? 1 : 2),
    ].slice(0, 4),
    summary_cue: sanitizeViewerLanguage(baseCue),
  };
}

export async function analyzeForm(
  frames: string[],
  exercise: Exercise,
  angles?: JointAngles,
  poseSummary?: PoseMotionSummary,
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
    poseSummary: summarizePoseMotion(poseSummary),
  });

  const angleText = angles ? `Measured joint angles: ${JSON.stringify(angles, null, 2)}` : "No joint angles provided.";
  const poseSummaryText = poseSummary
    ? `Pose motion summary: ${JSON.stringify(summarizePoseMotion(poseSummary), null, 2)}`
    : "No pose motion summary provided.";
  const movementGuard = evaluateMovementGuard(exercise, poseSummary);

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
          content: `You are an expert strength and conditioning coach analyzing exercise form from moments sampled out of one uploaded video clip.
${EXERCISE_CUES[exercise]}
${angleText}
${poseSummaryText}

Respond only with a JSON object matching this schema:
{
  "overall": "one sentence overall assessment",
  "score": <integer 0-100>,
  "correct": ["what they are doing well 1", "what they are doing well 2"],
  "errors": [
    { "joint": "body part name", "issue": "what is wrong", "cue": "corrective instruction" }
  ],
  "summary_cue": "the single most important correction",
  "exercise_match": "clear | unclear | mismatch",
  "exercise_confidence": <number 0-1>,
  "mismatch_reason": "why the clip does or does not clearly show the selected exercise"
}

Score guide:
90-100 = near perfect
70-89 = good with minor fixes
50-69 = significant issues
below 50 = major form breakdown

Be specific, honest, and actionable. Keep each string under 80 characters.
Never ask the user for images or talk about frames. Talk about their uploaded video or clip instead.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze my ${exercise} form from this uploaded video clip. These still moments were sampled from that one video.

Be strict about exercise matching. If the video does not clearly show a real ${exercise} rep, or it mostly shows unrelated movement, standing still, setup only, or random arm motion, mark exercise_match as mismatch or unclear and keep the score low.

Do not give a high score just because posture looks decent in a few still moments. The score must reflect whether the selected exercise is actually visible and repeatable in the clip.`,
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

  const parsed = JSON.parse(clean) as ModelAnalysisResponse;
  const normalized = normalizeFeedback(parsed);
  const guarded = applyMovementGuard(normalized, exercise, movementGuard, parsed);
  debugLog("openai/analyze", "OpenAI feedback normalized", {
    requestId: requestId ?? null,
    feedback: guarded,
    movementGuard,
    modelExerciseMatch: parsed.exercise_match ?? null,
    modelExerciseConfidence: parsed.exercise_confidence ?? null,
    modelMismatchReason: parsed.mismatch_reason ?? null,
  });

  return guarded;
}
