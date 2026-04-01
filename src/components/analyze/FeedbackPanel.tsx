// FILE: src/components/analyze/FeedbackPanel.tsx
"use client";

import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { LightbulbIcon } from "@phosphor-icons/react/dist/csr/Lightbulb";

import { Badge, Card, CardDivider, ScoreRing } from "@/components/ui";
import { exerciseLabel, exerciseTint, scoreBadgeVariant, scoreLabel } from "@/lib/utils";
import type { AnalysisFeedback, Exercise } from "@/types/analysis";

interface FeedbackPanelProps {
  feedback: AnalysisFeedback;
  exercise: Exercise;
}

export function FeedbackPanel({ feedback, exercise }: FeedbackPanelProps) {
  const primaryError = feedback.errors[0];

  return (
    <Card className="space-y-5">
      <div className="rounded-[1.75rem] border border-silver-800 bg-gradient-to-br from-white to-white_smoke-800 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="flex justify-center lg:justify-start">
            <div className="flex w-full max-w-[220px] flex-col items-center gap-3 rounded-[1.5rem] border border-silver-800 bg-white p-4 text-center">
              <ScoreRing score={feedback.score} />
              <div className="space-y-1">
                <p className="text-xs text-grey-600">Form score</p>
                <p className="text-2xl font-medium text-medium_slate_blue-500">{feedback.score}/100</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={scoreBadgeVariant(feedback.score)}>{scoreLabel(feedback.score)}</Badge>
              <Badge className={exerciseTint(exercise)}>{exerciseLabel(exercise)}</Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium text-charcoal-300">{feedback.overall}</h2>
              <p className="text-sm text-grey-500">
                Score reflects joint position, control, rhythm, and how repeatable the rep looks.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-silver-800 bg-white p-4">
                <p className="text-xs text-grey-600">Strong cues</p>
                <p className="mt-2 text-3xl font-medium text-charcoal-300">{feedback.correct.length}</p>
                <p className="mt-1 text-sm text-grey-500">Positive checkpoints the model would keep in your next rep.</p>
              </div>
              <div className="rounded-2xl border border-silver-800 bg-white p-4">
                <p className="text-xs text-grey-600">What to repeat</p>
                <p className="mt-2 text-sm font-medium text-charcoal-300">
                  {feedback.correct[0] ?? "Your setup looks stable enough to keep building from here."}
                </p>
              </div>
              <div className="rounded-2xl border border-silver-800 bg-white p-4 sm:col-span-2">
                <p className="text-xs text-grey-600">Fix first</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-charcoal-300">{primaryError?.joint ?? "No major fault"}</p>
                  <p className="text-sm text-grey-500">
                    {primaryError ? `${primaryError.issue}. ${primaryError.cue}` : "No major breakdown flagged in this clip."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardDivider />

      <section className="space-y-3">
        <h3 className="text-base font-medium text-charcoal-300">What you&apos;re doing well</h3>
        <div className="space-y-3">
          {feedback.correct.length > 0 ? (
            feedback.correct.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
                <CheckCircleIcon size={20} weight="fill" className="mt-0.5 text-wisteria-300" />
                <p className="text-sm text-charcoal-300">{item}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-grey-500">Your reps show promise. The next pass should surface more positives.</p>
          )}
        </div>
      </section>

      <CardDivider />

      <section className="space-y-3">
        <h3 className="text-base font-medium text-charcoal-300">Form errors</h3>
        <div className="space-y-3">
          {feedback.errors.length > 0 ? (
            feedback.errors.map((error) => (
              <div key={`${error.joint}-${error.issue}`} className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal-300">{error.joint}</p>
                    <p className="mt-1 text-sm text-grey-500">{error.issue}</p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-powder_petal-800 px-3 py-1 text-xs font-medium text-powder_petal-200">
                    {error.cue}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-grey-500">No major faults flagged in this clip. Keep building consistency.</p>
          )}
        </div>
      </section>

      <div className="rounded-2xl border border-medium_slate_blue-700 bg-medium_slate_blue-900 p-4">
        <div className="flex items-start gap-3">
          <LightbulbIcon size={20} className="mt-0.5 text-medium_slate_blue-400" />
          <div>
            <p className="text-sm font-medium text-charcoal-300">Most important cue</p>
            <p className="mt-1 text-sm text-grey-500">{feedback.summary_cue}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
