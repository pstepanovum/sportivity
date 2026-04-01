// FILE: src/components/home/LandingPage.tsx
"use client";

import Link from "next/link";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BarbellIcon } from "@phosphor-icons/react/dist/csr/Barbell";
import { ChatsIcon } from "@phosphor-icons/react/dist/csr/Chats";
import { HandFistIcon } from "@phosphor-icons/react/dist/csr/HandFist";
import { PersonSimpleRunIcon } from "@phosphor-icons/react/dist/csr/PersonSimpleRun";
import { VideoIcon } from "@phosphor-icons/react/dist/csr/Video";

import { Badge, Button, Card, ScoreRing } from "@/components/ui";

const HOW_IT_WORKS = [
  {
    title: "Upload a clip",
    description: "Use your phone or laptop to send one short rep, or record inside the app.",
    Icon: VideoIcon,
  },
  {
    title: "AI reads your pose",
    description: "MediaPipe tracks joints in-browser and packages angle data for the model.",
    Icon: PersonSimpleRunIcon,
  },
  {
    title: "Get coaching cues",
    description: "Sportivity scores the lift and tells you exactly what to keep and fix.",
    Icon: ChatsIcon,
  },
];

const EXERCISES = [
  { label: "Squat", Icon: PersonSimpleRunIcon },
  { label: "Deadlift", Icon: BarbellIcon },
  { label: "Push-up", Icon: HandFistIcon },
];

export function LandingPage() {
  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-[2rem] border border-silver-800 bg-gradient-to-br from-medium_slate_blue-900 via-white to-wisteria-900 p-8 md:p-10">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <Badge variant="brand">AI Form Coach</Badge>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-medium tracking-[-0.04em] text-charcoal-200 md:text-5xl">
                Train smarter. Move better.
              </h1>
              <p className="text-lg text-grey-500">
                Upload one set and get instant coaching cues powered by pose tracking and GPT-4o vision.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/analyze" prefetch={false}>
                <Button size="lg">
                  Analyze my form
                  <ArrowRightIcon size={20} />
                </Button>
              </Link>
              <Link href="/login" prefetch={false}>
                <Button variant="secondary" size="lg">
                  View progress
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Exercises", value: "3" },
                { label: "Frames sampled", value: "4" },
                { label: "Coach score", value: "0-100" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
                  <p className="text-sm text-grey-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-medium text-charcoal-200">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden bg-white/90 backdrop-blur">
            <div className="absolute inset-x-6 top-0 h-24 rounded-b-full bg-medium_slate_blue-900 blur-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-grey-500">Example session</p>
                  <h2 className="text-xl font-medium text-charcoal-300">Squat analysis</h2>
                </div>
                <Badge variant="brand">Live feedback</Badge>
              </div>

              <div className="flex items-center gap-6">
                <ScoreRing score={84} size={96} />
                <div className="space-y-2">
                  <p className="text-sm text-grey-500">Overall cue</p>
                  <p className="text-base font-medium text-charcoal-300">Drive your knees out and keep your chest taller.</p>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  "Depth looks strong and heels stay grounded.",
                  "Upper back stays mostly neutral through the rep.",
                  "Slight knee cave shows up near the bottom position.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4 text-sm text-charcoal-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-charcoal-300">How it works</h2>
          <p className="text-sm text-grey-500">A quick flow designed for feedback between sets, not after your workout is over.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ title, description, Icon }) => (
            <Card key={title} className="space-y-4">
              <span className="inline-flex rounded-full bg-medium_slate_blue-900 p-3 text-medium_slate_blue-500">
                <Icon size={24} />
              </span>
              <div className="space-y-2">
                <h3 className="text-base font-medium text-charcoal-300">{title}</h3>
                <p className="text-sm text-grey-500">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-charcoal-300">Exercises supported</h2>
          <p className="text-sm text-grey-500">Start with the three most common movement patterns for coaching and progress tracking.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {EXERCISES.map(({ label, Icon }) => (
            <div key={label} className="rounded-2xl bg-soft_periwinkle-900 p-6">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-white/80 p-3 text-medium_slate_blue-500">
                  <Icon size={24} weight="fill" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-charcoal-300">{label}</h3>
                  <p className="text-sm text-grey-500">Coach positioning, control, and repeatability rep by rep.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
