# Sportivity

Sportivity is an AI-powered fitness form coach built with Next.js, MediaPipe Pose, OpenAI, and Supabase.

Users can upload or record a short workout video, run in-browser pose detection, and receive structured coaching feedback with a form score, strengths, errors, and corrective cues.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- MediaPipe Pose
- OpenAI Vision
- Supabase Auth + Database

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with the required OpenAI and Supabase keys.

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`

## Notes

- MediaPipe pose detection runs in the browser.
- Auth and session history are powered by Supabase.
- The project is ready to be connected to Vercel, but Vercel project linkage is intentionally not stored in this repo.
