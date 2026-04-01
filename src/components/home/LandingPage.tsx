// FILE: src/components/home/LandingPage.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BarbellIcon } from "@phosphor-icons/react/dist/csr/Barbell";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { ChatsIcon } from "@phosphor-icons/react/dist/csr/Chats";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { DeviceMobileCameraIcon } from "@phosphor-icons/react/dist/csr/DeviceMobileCamera";
import { HandFistIcon } from "@phosphor-icons/react/dist/csr/HandFist";
import { PersonSimpleRunIcon } from "@phosphor-icons/react/dist/csr/PersonSimpleRun";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";
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

const HERO_STATS = [
  { label: "Exercises", value: "3" },
  { label: "Frames sampled", value: "4" },
  { label: "Coach score", value: "0-100" },
  { label: "Replay saved", value: "Yes" },
];

const FILMING_GUIDE = [
  "Film from the side",
  "Keep your full body in frame",
  "Set the phone around hip height",
];

const VALUE_PILLARS = [
  {
    title: "Simple filming setup",
    description: "The app is designed around a clean side-angle capture so the model reads movement fast.",
    Icon: DeviceMobileCameraIcon,
  },
  {
    title: "Coaching that tells you what to fix",
    description: "See what stayed strong, what broke down, and the one cue to focus on next.",
    Icon: TargetIcon,
  },
  {
    title: "Progress you can revisit",
    description: "Every session keeps a score, summary, and breakdown so improvements are easy to track.",
    Icon: ChartLineUpIcon,
  },
];

export function LandingPage() {
  return (
    <div className="space-y-14 md:space-y-16">
      <section className="overflow-hidden rounded-[2rem] border border-silver-800 bg-[radial-gradient(circle_at_top_left,_rgba(113,97,239,0.14),_transparent_35%),linear-gradient(135deg,_#fbfbfd_0%,_#f2eefc_45%,_#f7f6fb_100%)] px-6 py-8 md:px-10 md:py-10">
        <div className="grid gap-10 md:grid-cols-[1.02fr_0.98fr] md:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="brand">AI Form Coach</Badge>
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-medium tracking-[-0.05em] text-charcoal-200 md:text-6xl">
                  Better feedback for every rep you film.
                </h1>
                <p className="max-w-xl text-lg text-grey-500">
                  Sportivity turns one clean lift into a coach score, precise form cues, and a replay you can come back to between sets.
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
              <Link href="/login" prefetch={false}>
                <Button variant="secondary" size="lg">
                  See the dashboard
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Side-angle friendly", "Mobile recording built in", "Feedback in seconds"].map((pill) => (
                <span key={pill} className="inline-flex items-center rounded-full border border-silver-800 bg-white/70 px-3 py-1.5 text-sm text-charcoal-300">
                  {pill}
                </span>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur">
                  <p className="text-sm text-grey-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-medium text-charcoal-200">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-10 h-36 w-36 rounded-full bg-medium_slate_blue-900 blur-3xl" />
            <div className="absolute bottom-12 right-10 h-32 w-32 rounded-full bg-wisteria-900 blur-3xl" />

            <div className="relative mx-auto max-w-[30rem]">
              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 backdrop-blur md:p-6">
                <div className="grid gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-grey-500">Athlete snapshot</p>
                      <h2 className="text-xl font-medium text-charcoal-300">One rep. Clear direction.</h2>
                    </div>
                    <Badge variant="brand">Demo ready</Badge>
                  </div>

                  <div className="rounded-[1.75rem] border border-silver-800 bg-gradient-to-br from-white to-soft_periwinkle-900 px-4 py-5">
                    <Image
                      src="/illustrations/09.svg"
                      alt="Athlete celebrating progress"
                      width={424}
                      height={522}
                      priority
                      className="mx-auto h-auto w-full max-w-[15.5rem] md:max-w-[16.5rem]"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                    <div className="flex items-center justify-center rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
                      <ScoreRing score={84} size={88} />
                    </div>
                    <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
                      <p className="text-sm text-grey-500">Current focus</p>
                      <p className="mt-2 text-base font-medium text-charcoal-300">
                        Stay tall through the bottom and push the knees out as you stand.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-3 top-12 hidden rounded-2xl border border-silver-800 bg-white px-4 py-3 md:block">
                <div className="flex items-center gap-2 text-sm text-charcoal-300">
                  <SparkleIcon size={18} className="text-medium_slate_blue-500" />
                  <span>Replay saved for review</span>
                </div>
              </div>

              <div className="absolute -right-3 bottom-10 hidden rounded-2xl border border-silver-800 bg-white px-4 py-3 md:block">
                <div className="flex items-center gap-2 text-sm text-charcoal-300">
                  <ChartLineUpIcon size={18} className="text-medium_slate_blue-500" />
                  <span>Track every session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5 bg-white">
          <div className="space-y-2">
            <Badge>Filming guide</Badge>
            <h2 className="text-xl font-medium text-charcoal-300">Capture once, get cleaner coaching.</h2>
            <p className="text-sm text-grey-500">
              Sportivity works best when the lift is easy to read. A simple setup gives the model clearer body positions and gives you better cues back.
            </p>
          </div>

          <div className="grid gap-3">
            {FILMING_GUIDE.map((tip) => (
              <div key={tip} className="flex items-center gap-3 rounded-2xl border border-silver-800 bg-white_smoke-800 px-4 py-3">
                <CheckCircleIcon size={20} weight="fill" className="text-medium_slate_blue-500" />
                <span className="text-sm text-charcoal-300">{tip}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-silver-800 bg-soft_periwinkle-900 p-4">
            <p className="text-sm text-charcoal-300">Built for quick gym feedback</p>
            <p className="mt-1 text-sm text-grey-500">
              Record on mobile, upload from your library, or grab a laptop clip without changing the rest of your workflow.
            </p>
          </div>
        </Card>

        <Card className="space-y-5 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-grey-500">Example feedback</p>
              <h2 className="text-xl font-medium text-charcoal-300">What the athlete sees after one set</h2>
            </div>
            <Badge variant="brand">Live feedback</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-5">
              <div className="flex items-center justify-center">
                <ScoreRing score={84} size={110} />
              </div>
              <div className="mt-4 space-y-1 text-center">
                <p className="text-sm text-grey-500">Form score</p>
                <p className="text-base font-medium text-charcoal-300">Good with one main fix</p>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                "Depth looks strong and the heels stay planted.",
                "Upper back stays mostly neutral through the rep.",
                "Knees drift in slightly at the bottom position.",
              ].map((item, index) => (
                <div key={item} className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-grey-500">{index < 2 ? "Strong cue" : "Fix first"}</p>
                  <p className="mt-2 text-sm text-charcoal-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-charcoal-300">Why athletes use it between sets</h2>
          <p className="text-sm text-grey-500">The product is built for short feedback loops, not slow post-workout review.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {VALUE_PILLARS.map(({ title, description, Icon }) => (
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

      <section className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-charcoal-300">How it works</h2>
            <p className="text-sm text-grey-500">A fast loop designed so you can film, review, and adjust without leaving the workout.</p>
          </div>
          <Badge>Browser pose tracking + GPT-4o vision</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ title, description, Icon }, index) => (
            <Card key={title} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex rounded-full bg-medium_slate_blue-900 p-3 text-medium_slate_blue-500">
                  <Icon size={24} />
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
          <p className="text-sm text-grey-500">Start with three high-signal movement patterns and build repeatable coaching around them.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {EXERCISES.map(({ label, Icon }) => (
            <div key={label} className="rounded-2xl border border-silver-800 bg-soft_periwinkle-900 p-6">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-white/80 p-3 text-medium_slate_blue-500">
                  <Icon size={24} weight="fill" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-charcoal-300">{label}</h3>
                  <p className="text-sm text-grey-500">Coach positioning, control, and consistency rep by rep.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
