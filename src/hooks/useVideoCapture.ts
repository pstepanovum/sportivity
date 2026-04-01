// FILE: src/hooks/useVideoCapture.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { debugClientEvent } from "@/lib/debug";

function getSupportedMimeType() {
  const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function getBaseMimeType(mimeType?: string | null) {
  return mimeType?.split(";")[0]?.trim().toLowerCase() || "video/webm";
}

function getFileExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/webm":
    default:
      return "webm";
  }
}

type CameraFacingMode = "user" | "environment";

interface StartCameraOptions {
  facingMode?: CameraFacingMode;
  videoElement?: HTMLVideoElement | null;
}

export function useVideoCapture() {
  const [hasStream, setHasStream] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const attachStream = useCallback(async (videoElement?: HTMLVideoElement | null) => {
    if (!videoElement) {
      debugClientEvent("videoCapture", "attachStream skipped because no video element is mounted yet");
      return;
    }

    if (!streamRef.current) {
      debugClientEvent("videoCapture", "attachStream found no active stream; clearing video element");
      videoElement.pause();
      videoElement.srcObject = null;
      return;
    }

    const [track] = streamRef.current.getVideoTracks();
    debugClientEvent("videoCapture", "Attaching active stream to preview element", {
      trackLabel: track?.label ?? null,
      trackSettings: track?.getSettings?.() ?? null,
      trackReadyState: track?.readyState ?? null,
    });

    videoElement.srcObject = streamRef.current;
    videoElement.muted = true;
    videoElement.playsInline = true;
    await videoElement.play().catch(() => undefined);
    debugClientEvent("videoCapture", "Preview video play() requested");
  }, []);

  const stopCamera = useCallback((videoElement?: HTMLVideoElement | null) => {
    const tracks = streamRef.current?.getTracks().map((track) => ({
      kind: track.kind,
      label: track.label,
      readyState: track.readyState,
    })) ?? [];

    debugClientEvent("videoCapture", "Stopping camera stream", {
      trackCount: tracks.length,
      tracks,
    });

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setHasStream(false);

    if (videoElement) {
      videoElement.pause();
      videoElement.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async ({ facingMode = "user", videoElement }: StartCameraOptions = {}) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is not supported in this browser.");
    }

    debugClientEvent("videoCapture", "Requesting camera access", {
      requestedFacingMode: facingMode,
    });

    const preferredConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: { ideal: facingMode },
      },
      audio: false,
    };

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia(preferredConstraints);
    } catch (error) {
      debugClientEvent("videoCapture", "Preferred camera access failed; retrying with fallback constraints", {
        requestedFacingMode: facingMode,
        error: error instanceof Error ? error.message : String(error),
      });

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    }

    streamRef.current = stream;
    setHasStream(true);

    const [track] = stream.getVideoTracks();
    debugClientEvent("videoCapture", "Camera access granted", {
      streamId: stream.id,
      active: stream.active,
      requestedFacingMode: facingMode,
      trackLabel: track?.label ?? null,
      trackSettings: track?.getSettings?.() ?? null,
      trackReadyState: track?.readyState ?? null,
    });

    await attachStream(videoElement);

    return stream;
  }, [attachStream]);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      throw new Error("Start the camera before recording.");
    }

    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    const recorder = mimeType ? new MediaRecorder(streamRef.current, { mimeType }) : new MediaRecorder(streamRef.current);

    debugClientEvent("videoCapture", "Creating MediaRecorder", {
      requestedMimeType: mimeType ?? null,
      actualMimeType: recorder.mimeType || null,
      streamActive: streamRef.current.active,
    });

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }

      debugClientEvent("videoCapture", "Recorder emitted data chunk", {
        chunkSize: event.data.size,
        chunkType: event.data.type || null,
        totalChunks: chunksRef.current.length,
      });
    };

    recorder.onerror = (event) => {
      debugClientEvent("videoCapture", "MediaRecorder emitted an error event", {
        mimeType: recorder.mimeType || null,
        state: recorder.state,
        eventType: event.type,
      });
    };

    await new Promise<void>((resolve) => {
      recorder.onstart = () => {
        setIsRecording(true);
        debugClientEvent("videoCapture", "Recording started", {
          mimeType: recorder.mimeType || null,
          state: recorder.state,
        });
        resolve();
      };

      recorder.start();
    });
  }, []);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      debugClientEvent("videoCapture", "stopRecording called without an active recorder");
      return null;
    }

    debugClientEvent("videoCapture", "Stopping recording", {
      mimeType: recorder.mimeType || null,
      state: recorder.state,
      chunkCount: chunksRef.current.length,
    });

    return new Promise<File | null>((resolve) => {
      recorder.onstop = () => {
        const chunkCount = chunksRef.current.length;
        const normalizedMimeType = getBaseMimeType(recorder.mimeType);
        const blob = new Blob(chunksRef.current, {
          type: normalizedMimeType,
        });
        const extension = getFileExtensionFromMimeType(normalizedMimeType);

        chunksRef.current = [];
        mediaRecorderRef.current = null;
        setIsRecording(false);

        const file = new File([blob], `sportivity-${Date.now()}.${extension}`, {
          type: blob.type || normalizedMimeType,
        });

        debugClientEvent("videoCapture", "Recording stopped and file created", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          chunkCount,
          normalizedMimeType,
        });

        resolve(file);
      };

      recorder.stop();
    });
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    attachStream,
    hasStream,
    isRecording,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
  };
}
