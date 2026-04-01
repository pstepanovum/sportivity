// FILE: src/lib/mediapipe/pose.ts
import type { PosePoint } from "@/types/analysis";

type PoseInstance = {
  onResults: (handler: (results: { poseLandmarks?: PosePoint[] }) => void) => void;
  setOptions: (options: Record<string, unknown>) => void;
  initialize: () => Promise<void>;
  send: (payload: { image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement }) => Promise<void>;
};

let poseInstance: PoseInstance | null = null;

let isInitialized = false;
let initializationPromise: Promise<PoseInstance> | null = null;
let sendQueue: Promise<void> = Promise.resolve();

export async function initPose() {
  if (isInitialized && poseInstance) return poseInstance;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const { Pose } = await import("@mediapipe/pose");

    const instance = new Pose({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
    }) as PoseInstance;

    instance.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    await instance.initialize();

    poseInstance = instance;
    isInitialized = true;
    return instance;
  })().catch((error) => {
    initializationPromise = null;
    poseInstance = null;
    isInitialized = false;
    throw error;
  });

  return initializationPromise;
}

export async function extractLandmarks(
  pose: Awaited<ReturnType<typeof initPose>>,
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<PosePoint[]> {
  const task = sendQueue.then(
    () =>
      new Promise<PosePoint[]>((resolve, reject) => {
        if (!pose) {
          reject(new Error("Pose model is not initialized."));
          return;
        }

        pose.onResults((results) => {
          resolve(results.poseLandmarks ?? []);
        });

        void pose.send({ image: source }).catch(reject);
      }),
  );

  sendQueue = task.then(
    () => undefined,
    () => undefined,
  );

  return task;
}
