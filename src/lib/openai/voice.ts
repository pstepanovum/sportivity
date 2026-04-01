// FILE: src/lib/openai/voice.ts
import type { AnalysisFeedback, CoachStyle, CoachVoice, Exercise } from "@/types/analysis";
import { getFirstName } from "@/lib/utils";

export const DEFAULT_COACH_VOICE: CoachVoice = "alloy";
export const DEFAULT_COACH_STYLE: CoachStyle = "supportive";

export const COACH_VOICES: Array<{
  description: string;
  id: CoachVoice;
  label: string;
}> = [
  {
    id: "alloy",
    label: "Alloy",
    description: "Balanced and direct",
  },
  {
    id: "sage",
    label: "Sage",
    description: "Calm and steady",
  },
  {
    id: "verse",
    label: "Verse",
    description: "Punchy and energetic",
  },
];

export const COACH_STYLES: Array<{
  description: string;
  id: CoachStyle;
  label: string;
}> = [
  {
    id: "supportive",
    label: "Supportive",
    description: "Encouraging and steady",
  },
  {
    id: "direct",
    label: "Direct",
    description: "Straight to the point",
  },
  {
    id: "intense",
    label: "Intense",
    description: "Fired up with some edge",
  },
];

export function isCoachVoice(value: unknown): value is CoachVoice {
  return COACH_VOICES.some((voice) => voice.id === value);
}

export function resolveCoachVoice(value: unknown): CoachVoice {
  return isCoachVoice(value) ? value : DEFAULT_COACH_VOICE;
}

export function isCoachStyle(value: unknown): value is CoachStyle {
  return COACH_STYLES.some((style) => style.id === value);
}

export function resolveCoachStyle(value: unknown): CoachStyle {
  return isCoachStyle(value) ? value : DEFAULT_COACH_STYLE;
}

const EXERCISE_WORDING: Record<Exercise, string> = {
  squat: "squat",
  deadlift: "deadlift",
  pushup: "push-up",
};

function cleanPhrase(value: string) {
  return value.trim().replace(/\.+$/, "");
}

function sentence(value: string) {
  return `${cleanPhrase(value)}.`;
}

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function scoreOpener(score: number, firstName: string | null, style: CoachStyle) {
  const name = firstName ? ` ${firstName}` : "";

  if (style === "supportive") {
    if (score >= 85) return `Yo${name}, that rep looked really solid`;
    if (score >= 70) return `Okay${name}, that was a strong rep with a couple things to sharpen`;
    if (score >= 50) return `Hmm${name}, there is a good base here`;
    return `Alright${name}, we have something to clean up`;
  }

  if (style === "direct") {
    if (score >= 85) return `${firstName ?? "Athlete"}, that was clean`;
    if (score >= 70) return `${firstName ?? "Athlete"}, close, but not tight enough yet`;
    if (score >= 50) return `${firstName ?? "Athlete"}, decent base, but you are leaking points`;
    return `${firstName ?? "Athlete"}, that rep needs a reset`;
  }

  if (score >= 85) return `Yo${name}, that was damn solid`;
  if (score >= 70) return `Okay${name}, not bad, but we can hit this harder`;
  if (score >= 50) return `Hmm${name}, there is something here, but that rep got messy`;
  return `Alright${name}, that one was rough, so let's fix it fast`;
}

function scoreRead(score: number, exercise: Exercise, style: CoachStyle) {
  const exerciseName = EXERCISE_WORDING[exercise];

  if (style === "supportive") {
    if (score >= 85) return `That ${exerciseName} landed at ${score} out of 100, and it is in a really good place`;
    if (score >= 70) return `That ${exerciseName} came in at ${score} out of 100, and it is close to feeling repeatable`;
    if (score >= 50) return `That ${exerciseName} scored ${score} out of 100, so the base is there but it still needs cleanup`;
    return `That ${exerciseName} scored ${score} out of 100, so slow it down and rebuild the shape`;
  }

  if (style === "direct") {
    if (score >= 85) return `${score} out of 100 on that ${exerciseName}, and that is a strong rep`;
    if (score >= 70) return `${score} out of 100 on that ${exerciseName}, good rep, not finished yet`;
    if (score >= 50) return `${score} out of 100 on that ${exerciseName}, workable, but too loose`;
    return `${score} out of 100 on that ${exerciseName}, and that is not ready to repeat`;
  }

  if (score >= 85) return `${score} out of 100 on that ${exerciseName}, and yeah, that looked strong`;
  if (score >= 70) return `${score} out of 100 on that ${exerciseName}, solid, but there is still more in the tank`;
  if (score >= 50) return `${score} out of 100 on that ${exerciseName}, and the rep had some sloppy moments`;
  return `${score} out of 100 on that ${exerciseName}, and that one needs a serious cleanup`;
}

function positiveRead(positiveCue: string | undefined, style: CoachStyle) {
  if (!positiveCue) return null;

  if (style === "supportive") return `Keep this: ${lowerFirst(cleanPhrase(positiveCue))}`;
  if (style === "direct") return `What you keep is this: ${lowerFirst(cleanPhrase(positiveCue))}`;
  return `What stayed good: ${lowerFirst(cleanPhrase(positiveCue))}`;
}

function correctionRead(
  error: AnalysisFeedback["errors"][number] | undefined,
  summaryCue: string,
  style: CoachStyle,
) {
  if (!error) {
    if (style === "supportive") return `Take this into the next rep: ${lowerFirst(cleanPhrase(summaryCue))}`;
    if (style === "direct") return `Next rep, ${lowerFirst(cleanPhrase(summaryCue))}`;
    return `Next rep, ${lowerFirst(cleanPhrase(summaryCue))} and make it count`;
  }

  const issue = cleanPhrase(error.issue);
  const cue = cleanPhrase(error.cue);

  if (style === "supportive") {
    return `The first thing I want you to fix is the ${error.joint} because it is ${issue}. Next rep, ${lowerFirst(cue)}`;
  }

  if (style === "direct") {
    return `The leak is at the ${error.joint}. It is ${issue}. Fix it by ${lowerFirst(cue)}`;
  }

  return `The breakdown starts at the ${error.joint}. It is ${issue}. Next rep, ${lowerFirst(cue)} and own it`;
}

function closingLine(score: number, style: CoachStyle) {
  if (style === "supportive") {
    if (score >= 80) return "Stay with that rhythm and carry it into the next set";
    if (score >= 60) return "Clean up that one detail and the next rep should feel sharper";
    return "Take one calm, clean rep next and focus on that single correction";
  }

  if (style === "direct") {
    if (score >= 80) return "Run it back the same way";
    if (score >= 60) return "Fix that detail before you add speed";
    return "Slow it down and earn the next clean rep";
  }

  if (score >= 80) return "Run that back and make the next one hit even harder";
  if (score >= 60) return "Clean that one thing up and the next rep will feel way better";
  return "Slow the hell down, lock in, and fix that one thing first";
}

export function buildCoachSpeechInstructions(style: CoachStyle) {
  if (style === "supportive") {
    return "Speak like a supportive personal coach. Be warm, encouraging, personal, and natural. Avoid sounding robotic or reading labels.";
  }

  if (style === "direct") {
    return "Speak like a no-nonsense trainer. Be concise, confident, and direct. Sound human and practical, never robotic.";
  }

  return "Speak like an intense gym coach with an edge. Be fired up and personal. Occasional mild profanity is okay, but keep it natural and motivational. Never sound abusive or robotic.";
}

export function buildVoicePreviewInstructions(style: CoachStyle) {
  if (style === "supportive") {
    return "Speak like a warm, confident personal coach. Keep the sample short, welcoming, and natural.";
  }

  if (style === "direct") {
    return "Speak like a direct trainer. Keep the sample crisp, grounded, and human.";
  }

  return "Speak like an intense, high-energy trainer with a little edge. Keep it short, motivational, and natural.";
}

export function buildCoachScript({
  exercise,
  feedback,
  fullName,
  style = DEFAULT_COACH_STYLE,
}: {
  exercise: Exercise;
  feedback: AnalysisFeedback;
  fullName?: string | null;
  style?: CoachStyle;
}) {
  const firstName = getFirstName(fullName);
  const positiveCue = feedback.correct[0];
  const firstError = feedback.errors[0];

  return [
    sentence(scoreOpener(feedback.score, firstName, style)),
    sentence(scoreRead(feedback.score, exercise, style)),
    positiveCue ? sentence(positiveRead(positiveCue, style) ?? "") : null,
    sentence(correctionRead(firstError, feedback.summary_cue, style)),
    sentence(closingLine(feedback.score, style)),
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildVoicePreviewScript(fullName?: string | null, style: CoachStyle = DEFAULT_COACH_STYLE) {
  const firstName = getFirstName(fullName) ?? "athlete";

  if (style === "supportive") {
    return `Hey ${firstName}, I am your Sportivity coach. Bring me one clean rep, and I will help you see what looked strong and what to tune up next.`;
  }

  if (style === "direct") {
    return `Hey ${firstName}, I am your Sportivity coach. Show me the rep, and I will tell you exactly what to keep and what to fix.`;
  }

  return `Yo ${firstName}, I am your Sportivity coach. Give me one rep, and I will call out what looked strong and what needs work before the next set.`;
}
