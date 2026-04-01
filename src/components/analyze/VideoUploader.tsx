// FILE: src/components/analyze/VideoUploader.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { CameraIcon } from "@phosphor-icons/react/dist/csr/Camera";
import { StopIcon } from "@phosphor-icons/react/dist/csr/Stop";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { VideoIcon } from "@phosphor-icons/react/dist/csr/Video";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

import { useVideoCapture } from "@/hooks/useVideoCapture";
import { Badge, Button, Card } from "@/components/ui";
import { debugClientEvent, debugError } from "@/lib/debug";
import { cn, formatDuration } from "@/lib/utils";

const SUPPORTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function normalizeVideoMimeType(type?: string | null) {
  return type?.split(";")[0]?.trim().toLowerCase() || "";
}

function hasSupportedVideoExtension(fileName: string) {
  return [".mp4", ".mov", ".webm"].some((extension) => fileName.toLowerCase().endsWith(extension));
}

export interface VideoSelection {
  file: File | null;
  url: string | null;
  duration: number | null;
}

interface VideoUploaderProps {
  videoRef: RefObject<HTMLVideoElement>;
  value: VideoSelection;
  onChange: (selection: VideoSelection) => void;
}

export function VideoUploader({ videoRef, value, onChange }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previousUrlRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinishingRecord, setIsFinishingRecord] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const { attachStream, hasStream, isRecording, startCamera, stopCamera, startRecording, stopRecording } = useVideoCapture();

  const cameraLabel = isMobileDevice ? "cellphone camera" : "laptop camera";
  const previewLabel = isMobileDevice ? "Live cellphone camera preview" : "Live laptop camera preview";
  const uploadLabel = isMobileDevice ? "Use phone library" : "Choose file";
  const swapClipLabel = isMobileDevice ? "Use saved clip" : "Use uploaded clip";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const syncIsMobileDevice = () => {
      setIsMobileDevice(mediaQuery.matches);
    };

    syncIsMobileDevice();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncIsMobileDevice);
      return () => mediaQuery.removeEventListener("change", syncIsMobileDevice);
    }

    mediaQuery.addListener(syncIsMobileDevice);
    return () => mediaQuery.removeListener(syncIsMobileDevice);
  }, []);

  const revokeUrl = useCallback((url?: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const setSelection = useCallback(
    (selection: VideoSelection) => {
      revokeUrl(previousUrlRef.current);
      previousUrlRef.current = selection.url;
      onChange(selection);
    },
    [onChange, revokeUrl],
  );

  const applyFile = useCallback(
    async (file: File) => {
      const normalizedMimeType = normalizeVideoMimeType(file.type);
      const isSupportedType =
        SUPPORTED_TYPES.includes(normalizedMimeType) || (!normalizedMimeType && hasSupportedVideoExtension(file.name));

      debugClientEvent("videoUploader", "Applying video file", {
        fileName: file.name,
        fileType: file.type,
        normalizedMimeType,
        fileSize: file.size,
        isSupportedType,
      });

      if (!isSupportedType) {
        setError("Upload an mp4, mov, or webm video.");
        debugClientEvent("videoUploader", "Rejected video file because of unsupported type", {
          fileName: file.name,
          fileType: file.type,
          normalizedMimeType,
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Video must be 100MB or smaller.");
        debugClientEvent("videoUploader", "Rejected video file because it is too large", {
          fileName: file.name,
          fileSize: file.size,
          maxFileSize: MAX_FILE_SIZE,
        });
        return;
      }

      stopCamera(videoRef.current);
      setError(null);
      const url = URL.createObjectURL(file);
      setSelection({
        file,
        url,
        duration: null,
      });

      debugClientEvent("videoUploader", "Video file accepted and preview URL created", {
        fileName: file.name,
        fileType: file.type,
        normalizedMimeType,
        previewUrl: url,
      });
    },
    [setSelection, stopCamera, videoRef],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      debugClientEvent("videoUploader", "Received file selection", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      await applyFile(file);
    },
    [applyFile],
  );

  const handleRecordToggle = async () => {
    try {
      setError(null);

      if (!hasStream) {
        throw new Error(`Open the ${cameraLabel} preview before you start recording.`);
      }

      if (!isRecording) {
        await startRecording();
        return;
      }

      setIsFinishingRecord(true);
      const file = await stopRecording();
      stopCamera(videoRef.current);

      if (file) {
        debugClientEvent("videoUploader", "Recorder returned a file for validation", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
        await applyFile(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record video.");
      debugClientEvent("videoUploader", "Record toggle failed", {
        error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
      });
      debugError("videoUploader", "Record toggle failed", err);
      stopCamera(videoRef.current);
    } finally {
      setIsFinishingRecord(false);
    }
  };

  const handleOpenCamera = async () => {
    try {
      setError(null);
      setSelection({
        file: null,
        url: null,
        duration: null,
      });
      debugClientEvent("videoUploader", "Opening camera flow", {
        cameraMode: isMobileDevice ? "mobile" : "desktop",
        requestedFacingMode: isMobileDevice ? "environment" : "user",
      });
      await startCamera({
        facingMode: isMobileDevice ? "environment" : "user",
        videoElement: videoRef.current,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to start the ${cameraLabel}.`);
      debugClientEvent("videoUploader", "Failed to open camera", {
        error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
      });
      debugError("videoUploader", "Failed to open camera", err);
      stopCamera(videoRef.current);
    }
  };

  const handleCloseCamera = () => {
    debugClientEvent("videoUploader", "Closing camera flow", {
      cameraMode: isMobileDevice ? "mobile" : "desktop",
    });
    stopCamera(videoRef.current);
  };

  const clearSelection = () => {
    debugClientEvent("videoUploader", "Clearing selected video");
    stopCamera(videoRef.current);
    setError(null);
    setSelection({
      file: null,
      url: null,
      duration: null,
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(
    () => () => {
      revokeUrl(previousUrlRef.current);
    },
    [revokeUrl],
  );

  useEffect(() => {
    if (!hasStream) {
      return;
    }

    debugClientEvent("videoUploader", "Detected active stream; attaching preview element");
    void attachStream(videoRef.current);
  }, [attachStream, hasStream, videoRef]);

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-medium text-charcoal-300">Upload or record your set</h3>
        <p className="text-sm text-grey-500">
          {isMobileDevice
            ? "Use your phone library, or switch to the rear camera and record one clean rep right here."
            : "Drop a clip, choose a file, or record one rep directly from your camera."}
        </p>
      </div>

      <div
        role="presentation"
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border border-dashed border-silver-600 bg-white_smoke-800 p-6 transition-colors",
          isDragging && "border-medium_slate_blue-500 bg-soft_periwinkle-900",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          capture={isMobileDevice ? "environment" : undefined}
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />

        {value.url || hasStream ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-silver-800 bg-charcoal-100">
              <video
                ref={videoRef}
                src={hasStream ? undefined : value.url ?? undefined}
                controls={Boolean(value.url) && !hasStream}
                autoPlay={hasStream}
                muted={hasStream}
                playsInline
                className="aspect-video w-full object-cover"
                onLoadedMetadata={() => {
                  const duration = videoRef.current?.duration ?? null;
                  onChange({
                    ...value,
                    duration: Number.isFinite(duration) ? duration : null,
                  });
                }}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-charcoal-300">
                  <VideoIcon size={20} />
                  <span>
                    {value.file?.name
                      ?? (isRecording ? "Recording in progress" : hasStream ? previewLabel : "Camera preview")}
                  </span>
                </div>
                <p className="text-xs text-grey-600">
                  {value.duration
                    ? `${formatDuration(value.duration)} duration`
                    : hasStream
                      ? isRecording
                        ? `Recording from your ${cameraLabel}`
                        : isMobileDevice
                          ? "Rear camera is live. Prop your phone and start recording when ready."
                          : "Camera is live. Start recording when you're ready."
                      : "Ready for analysis"}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {hasStream ? (
                  <>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => void handleRecordToggle()}
                      loading={isFinishingRecord}
                      className="w-full sm:w-auto"
                    >
                      {isRecording ? <StopIcon size={18} /> : <CameraIcon size={18} />}
                      {isRecording ? "Stop recording" : "Start recording"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCloseCamera} className="w-full sm:w-auto">
                      <XIcon size={18} />
                      Turn camera off
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="w-full sm:w-auto">
                      <UploadSimpleIcon size={18} />
                      {swapClipLabel}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} className="w-full sm:w-auto">
                      <UploadSimpleIcon size={18} />
                      {isMobileDevice ? "Choose another clip" : "Replace"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void handleOpenCamera()} className="w-full sm:w-auto">
                      <CameraIcon size={18} />
                      {isMobileDevice ? "Use cellphone camera" : "Use laptop camera"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={clearSelection} className="w-full sm:w-auto">
                      <XIcon size={18} />
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="rounded-full bg-medium_slate_blue-900 p-4 text-medium_slate_blue-500">
              <UploadSimpleIcon size={24} />
            </span>
            <div className="space-y-1">
              <p className="text-base font-medium text-charcoal-300">Drop your workout clip here</p>
              <p className="text-sm text-grey-500">
                {isMobileDevice
                  ? "Use your library or rear camera. Supports mp4, mov, and webm up to 100MB."
                  : "Supports mp4, mov, and webm up to 100MB."}
              </p>
            </div>
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} className="w-full sm:w-auto">
                <UploadSimpleIcon size={18} />
                {uploadLabel}
              </Button>
              <Button type="button" variant="ghost" onClick={() => void handleOpenCamera()} className="w-full sm:w-auto">
                <CameraIcon size={18} />
                {isMobileDevice ? "Use cellphone camera" : "Use laptop camera"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {error ? <Badge variant="error">{error}</Badge> : null}
    </Card>
  );
}
