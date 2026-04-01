// FILE: src/types/analysis.ts
export type Exercise = "squat" | "deadlift" | "pushup";
export type CoachVoice = "alloy" | "sage" | "verse";
export type CoachStyle = "supportive" | "direct" | "intense";

export type AnalysisStatus = "idle" | "extracting" | "analyzing" | "done" | "error";

export interface JointError {
  joint: string;
  issue: string;
  cue: string;
}

export interface AnalysisFeedback {
  overall: string;
  score: number;
  correct: string[];
  errors: JointError[];
  summary_cue: string;
}

export interface JointAngles {
  leftKnee?: number;
  rightKnee?: number;
  leftHip?: number;
  rightHip?: number;
  leftElbow?: number;
  rightElbow?: number;
  spine?: number;
}

export interface PoseMotionSummary {
  averages?: JointAngles;
  framesAnalyzed: number;
  framesWithPose: number;
  maxes?: JointAngles;
  mins?: JointAngles;
  poseCoverage: number;
  ranges?: JointAngles;
}

export interface AnalysisRequest {
  exercise: Exercise;
  frames: string[];
  angles?: JointAngles;
  poseSummary?: PoseMotionSummary;
}

export interface PosePoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface CoachVoiceFeedback {
  audioBase64: string;
  mimeType: string;
  script: string;
  voice: CoachVoice;
}
