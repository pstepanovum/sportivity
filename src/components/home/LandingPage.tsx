// FILE: src/components/home/LandingPage.tsx
"use client";

import Link from "next/link";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BarbellIcon } from "@phosphor-icons/react/dist/csr/Barbell";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { ChatsIcon } from "@phosphor-icons/react/dist/csr/Chats";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { DeviceMobileCameraIcon } from "@phosphor-icons/react/dist/csr/DeviceMobileCamera";
import { HandFistIcon } from "@phosphor-icons/react/dist/csr/HandFist";
import { PersonSimpleRunIcon } from "@phosphor-icons/react/dist/csr/PersonSimpleRun";
import { VideoIcon } from "@phosphor-icons/react/dist/csr/Video";

import { Badge, Button, Card, ScoreRing, Ticker } from "@/components/ui";
import { cn } from "@/lib/utils";

const HERO_POINTS = [
  "Film from the side",
  "Get one clear cue",
  "Save the replay",
];

const HERO_TICKER_ITEMS = [
  { label: "Upload" },
  { label: "Track" },
  { label: "Coach" },
  { label: "Replay" },
];

const FEATURE_CARDS = [
  {
    title: "Film with less guesswork",
    description: "A simple side-angle setup gives the model a cleaner view of your movement.",
    detail: "Best results come from full-body framing and one clean rep.",
    Icon: DeviceMobileCameraIcon,
    wide: false,
  },
  {
    title: "See the right fix faster",
    description: "Sportivity scores the rep and tells you what stayed strong and what needs attention.",
    detail: "The goal is one useful coaching cue you can carry into the next set.",
    Icon: ChatsIcon,
    wide: false,
  },
  {
    title: "Keep every session visible",
    description: "Saved scores and replays make it easy to review progress over time.",
    detail: "Open any session again and revisit the exact breakdown later.",
    Icon: ChartLineUpIcon,
    wide: true,
  },
];

const HOW_IT_WORKS = [
  {
    title: "Record or upload",
    description: "Use your phone, laptop, or saved library clip.",
    Icon: VideoIcon,
  },
  {
    title: "Read the movement",
    description: "MediaPipe and GPT-4o vision analyze the rep together.",
    Icon: PersonSimpleRunIcon,
  },
  {
    title: "Adjust the next set",
    description: "Take the score, cue, and replay straight into your next attempt.",
    Icon: CheckCircleIcon,
  },
];

const EXERCISES = [
  { label: "Squat", Icon: PersonSimpleRunIcon },
  { label: "Deadlift", Icon: BarbellIcon },
  { label: "Push-up", Icon: HandFistIcon },
];

export function LandingPage() {
  return (
    <div className="space-y-12 md:space-y-14">
      <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(113,97,239,0.12),_transparent_35%),linear-gradient(135deg,_#fbfbfd_0%,_#f6f3ff_40%,_#fcfcfd_100%)] p-0">
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.08fr_0.92fr] md:px-8 md:py-8 lg:px-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="brand">AI Form Coach</Badge>
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-medium tracking-[-0.05em] text-charcoal-200 md:text-6xl">
                  Train smarter. Fix form faster.
                </h1>
                <p className="max-w-xl text-lg text-grey-500">
                  Sportivity turns one filmed rep into a score, a replay, and the one coaching cue worth taking into the next set.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/analyze" prefetch={false}>
                <Button size="lg">
                  Analyze my form
                  <ArrowRightIcon size={20} />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {HERO_POINTS.map((point) => (
                <span key={point} className="inline-flex items-center rounded-full border border-silver-800 bg-white/80 px-3 py-1.5 text-sm text-charcoal-300">
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="dotted rounded-[1.75rem] border border-silver-800 bg-white/85 p-5">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-grey-500">Sample session</p>
                    <h2 className="text-xl font-medium text-charcoal-300">One rep. One priority.</h2>
                  </div>
                  <Badge variant="brand">84 score</Badge>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-silver-800 bg-white_smoke-800 p-4">
                  <ScoreRing score={84} size={88} />
                  <div className="space-y-1">
                    <p className="text-sm text-grey-500">Current focus</p>
                    <p className="text-base font-medium text-charcoal-300">
                      Drive the knees out and stay taller through the bottom.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-silver-800 bg-white px-4 py-3">
                    <p className="text-xs text-grey-500">Strong cue</p>
                    <p className="mt-2 text-sm text-charcoal-300">Depth looks solid and the heels stay grounded.</p>
                  </div>
                  <div className="rounded-xl border border-silver-800 bg-white px-4 py-3">
                    <p className="text-xs text-grey-500">Fix first</p>
                    <p className="mt-2 text-sm text-charcoal-300">Knees drift inward slightly near the bottom position.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-0">
          <Ticker
            items={HERO_TICKER_ITEMS}
            speed={28}
            copies={8}
            className="rounded-none border-x-0 border-b-0 border-t border-silver-800 bg-white/80 py-2"
          />
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {FEATURE_CARDS.map(({ title, description, detail, Icon, wide }) => (
          <Card key={title} className={cn("bg-white h-full", wide ? "md:col-span-2" : "")}>
            <div className={cn("flex h-full flex-col gap-4", wide ? "md:flex-row md:items-end md:justify-between md:gap-8" : "")}>
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-medium_slate_blue-900 p-3 text-medium_slate_blue-500">
                  <Icon size={22} />
                </span>
                <div className="space-y-2">
                  <h2 className="text-xl font-medium text-charcoal-300">{title}</h2>
                  <p className="text-sm text-grey-500">{description}</p>
                </div>
              </div>

              <div className={cn("mt-auto", wide ? "md:max-w-sm md:text-right" : "")}>
                <span className="inline-flex w-fit rounded-xl border border-silver-800 bg-white_smoke-800 px-4 py-2 text-sm text-charcoal-300">
                  {detail}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-charcoal-300">How it works</h2>
            <p className="text-sm text-grey-500">A short loop built for between sets, not after the workout is over.</p>
          </div>
          <Badge className="w-fit whitespace-nowrap">Browser pose tracking + GPT-4o vision</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ title, description, Icon }, index) => (
            <Card key={title} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-medium_slate_blue-900 p-3 text-medium_slate_blue-500">
                  <Icon size={20} />
                </span>
                <span className="text-sm text-grey-500">0{index + 1}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-medium text-charcoal-300">{title}</h3>
                <p className="text-sm text-grey-500">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-charcoal-300">Exercises supported</h2>
          <p className="text-sm text-grey-500">Three core movement patterns to start with simple, repeatable coaching.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {EXERCISES.map(({ label, Icon }) => (
            <Card key={label} className="bg-soft_periwinkle-900">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-white/80 p-3 text-medium_slate_blue-500">
                  <Icon size={22} weight="fill" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-charcoal-300">{label}</h3>
                  <p className="text-sm text-grey-500">Score the rep and keep the cue that matters most.</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
