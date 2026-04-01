// FILE: src/components/analyze/CoachVoiceCard.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { SpeakerHighIcon } from "@phosphor-icons/react/dist/csr/SpeakerHigh";

import { COACH_VOICES } from "@/lib/openai/voice";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import type { CoachVoiceFeedback } from "@/types/analysis";

interface CoachVoiceCardProps {
  audio: CoachVoiceFeedback | null;
  error: string | null;
  isLoading: boolean;
  autoPlayToken?: number;
}

export function CoachVoiceCard({ audio, error, isLoading, autoPlayToken }: CoachVoiceCardProps) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioUrl = useMemo(() => {
    if (!audio) return null;
    return `data:${audio.mimeType};base64,${audio.audioBase64}`;
  }, [audio]);

  useEffect(() => {
    const element = audioElementRef.current;

    if (!element || !audioUrl) {
      setIsPlaying(false);
      setAutoplayBlocked(false);
      return;
    }

    element.src = audioUrl;
    element.currentTime = 0;

    const attemptAutoplay = async () => {
      try {
        await element.play();
        setAutoplayBlocked(false);
        setIsPlaying(true);
      } catch {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      }
    };

    void attemptAutoplay();
  }, [audioUrl, autoPlayToken]);

  const voiceLabel = COACH_VOICES.find((voice) => voice.id === audio?.voice)?.label ?? "Coach";

  const handleTogglePlayback = async () => {
    const element = audioElementRef.current;
    if (!element) return;

    if (isPlaying) {
      element.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await element.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  };

  const handleReplay = async () => {
    const element = audioElementRef.current;
    if (!element) return;

    element.currentTime = 0;

    try {
      await element.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
      setIsPlaying(false);
    }
  };

  return (
    <Card className="space-y-4">
      <audio
        ref={audioElementRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">AI voice coach</Badge>
            {audio ? <Badge>{voiceLabel}</Badge> : null}
          </div>
          <h3 className="text-xl font-medium text-charcoal-300">Coach playback</h3>
          <p className="text-sm text-grey-500">A short AI-generated recap of your latest rep, voiced like a gym coach.</p>
        </div>

        {audio ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void handleTogglePlayback()}>
              {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => void handleReplay()}>
              <ArrowClockwiseIcon size={18} />
              Replay
            </Button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-silver-800 bg-white_smoke-800 p-4 text-sm text-charcoal-300">
          <Spinner />
          Warming up your coach voice
        </div>
      ) : null}

      {error ? <Badge variant="error">{error}</Badge> : null}

      {autoplayBlocked && audio ? (
        <Badge variant="warning">Tap play to hear your coach recap.</Badge>
      ) : null}

      {audio ? (
        <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex rounded-full bg-medium_slate_blue-900 p-2 text-medium_slate_blue-500">
              <SpeakerHighIcon size={16} />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-charcoal-300">What your coach says</p>
              <p className="text-sm text-grey-500">{audio.script}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
