// FILE: src/components/analyze/VideoUploader.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { CameraIcon } from "@phosphor-icons/react/dist/csr/Camera";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
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
const FILMING_TIPS = [
  "Film from the side.",
  "Keep your full body visible.",
  "Place the phone around hip height.",
  "Record one clean rep with steady framing.",
];

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
  const [isMobileStudioOpen, setIsMobileStudioOpen] = useState(false);

  const { attachStream, hasStream, isRecording, startCamera, stopCamera, startRecording, stopRecording } = useVideoCapture();

  const cameraLabel = isMobileDevice ? "cellphone camera" : "laptop camera";
  const previewLabel = isMobileDevice ? "Live cellphone camera preview" : "Live laptop camera preview";
  const uploadLabel = isMobileDevice ? "Use phone library" : "Choose file";
  const swapClipLabel = isMobileDevice ? "Use saved clip" : "Use uploaded clip";
  const isExpandedMobileCapture = isMobileDevice && hasStream;
  const controlButtonSize = isExpandedMobileCapture ? "lg" : "sm";
  const shouldUseMobileStudio = isMobileDevice && isMobileStudioOpen;
  const selectedRepLabel = value.file?.name ?? (hasStream ? previewLabel : value.url ? "Selected rep" : "No rep selected");
  const selectedRepMeta = value.duration
    ? `${formatDuration(value.duration)} duration`
    : hasStream
      ? isRecording
        ? `Recording from your ${cameraLabel}`
        : isMobileDevice
          ? "Rear camera is live. Frame your body and start when ready."
          : "Camera is live. Start recording when you're ready."
      : value.url
        ? "Clip is selected and ready for analysis."
        : "No clip selected yet.";

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
      if (isMobileDevice) {
        setIsMobileStudioOpen(true);
      }
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

  const handleOpenLibrary = () => {
    if (isMobileDevice) {
      setIsMobileStudioOpen(true);
    }

    inputRef.current?.click();
  };

  const handleSwapToLibrary = () => {
    stopCamera(videoRef.current);
    handleOpenLibrary();
  };

  const handleDismissMobileStudio = () => {
    debugClientEvent("videoUploader", "Closing mobile capture studio", {
      hasStream,
      hasSelection: Boolean(value.url),
    });
    stopCamera(videoRef.current);
    setIsMobileStudioOpen(false);
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

    if (isMobileDevice) {
      setIsMobileStudioOpen(false);
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

  useEffect(() => {
    if (typeof document === "undefined" || !shouldUseMobileStudio) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldUseMobileStudio]);

  const renderFilmingGuide = (compact = false) => (
    <div className={cn("rounded-2xl border border-silver-800 bg-white p-4 text-left", compact && "border-medium_slate_blue-700")}>
      <p className="text-sm font-medium text-charcoal-300">For best results</p>
      <p className="mt-1 text-sm text-grey-500">
        Film from the side, keep your full body visible, and set the phone around hip height.
      </p>
      <div className="mt-3 grid gap-2">
        {FILMING_TIPS.map((tip) => (
          <div key={tip} className="flex items-center gap-2 text-sm text-charcoal-300">
            <CheckCircleIcon size={18} weight="fill" className="text-medium_slate_blue-500" />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreviewSurface = (isFullscreen = false) => (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-silver-800 bg-charcoal-100",
        isExpandedMobileCapture && "rounded-[1.5rem] border-medium_slate_blue-700",
        isFullscreen && "flex-1 rounded-[1.75rem] border-medium_slate_blue-700",
      )}
    >
      <video
        ref={videoRef}
        src={hasStream ? undefined : value.url ?? undefined}
        controls={Boolean(value.url) && !hasStream}
        autoPlay={hasStream}
        muted={hasStream}
        playsInline
        className={cn(
          "w-full object-cover",
          isFullscreen ? "h-full min-h-0" : isExpandedMobileCapture ? "aspect-[4/5] min-h-[420px]" : "aspect-video",
        )}
        onLoadedMetadata={() => {
          const duration = videoRef.current?.duration ?? null;
          onChange({
            ...value,
            duration: Number.isFinite(duration) ? duration : null,
          });
        }}
      />
    </div>
  );

  const renderSelectionMeta = (isFullscreen = false) => (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        isExpandedMobileCapture && "rounded-[1.5rem] bg-white p-4",
        isFullscreen && "rounded-[1.5rem] border border-silver-800 bg-white px-4 py-3",
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-charcoal-300">
          <VideoIcon size={20} />
          <span>{selectedRepLabel}</span>
        </div>
        <p className={cn("text-xs text-grey-600", (isExpandedMobileCapture || isFullscreen) && "text-sm")}>{selectedRepMeta}</p>
      </div>

      {value.url && !hasStream ? <Badge variant="brand">Selected rep</Badge> : null}
    </div>
  );

  const renderActionButtons = (isFullscreen = false) => (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap", isFullscreen && "gap-3")}>
      {hasStream ? (
        <>
          <Button
            type="button"
            variant="danger"
            size={isFullscreen ? "lg" : "sm"}
            onClick={() => void handleRecordToggle()}
            loading={isFinishingRecord}
            className="w-full justify-center"
          >
            {isRecording ? <StopIcon size={18} /> : <CameraIcon size={18} />}
            {isRecording ? "Stop recording" : "Start recording"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size={isFullscreen ? "lg" : controlButtonSize}
            onClick={handleSwapToLibrary}
            className="w-full justify-center"
          >
            <UploadSimpleIcon size={18} />
            {swapClipLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={isFullscreen ? "lg" : controlButtonSize}
            onClick={isFullscreen ? handleDismissMobileStudio : handleCloseCamera}
            className="w-full justify-center"
          >
            <XIcon size={18} />
            {isFullscreen ? "Close" : "Turn camera off"}
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="secondary"
            size={isFullscreen ? "lg" : controlButtonSize}
            onClick={handleOpenLibrary}
            className="w-full justify-center"
          >
            <UploadSimpleIcon size={18} />
            {value.url ? (isMobileDevice ? "Choose another clip" : "Replace") : uploadLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={isFullscreen ? "lg" : controlButtonSize}
            onClick={() => void handleOpenCamera()}
            className="w-full justify-center"
          >
            <CameraIcon size={18} />
            {isMobileDevice ? "Use cellphone camera" : "Use laptop camera"}
          </Button>
          {value.url ? (
            <Button
              type="button"
              variant="ghost"
              size={isFullscreen ? "lg" : controlButtonSize}
              onClick={clearSelection}
              className="w-full justify-center"
            >
              <XIcon size={18} />
              Delete rep
            </Button>
          ) : null}
        </>
      )}
    </div>
  );

  return (
    <>
      <Card className={cn("space-y-4", isExpandedMobileCapture && "-mx-4 rounded-[2rem] p-4 sm:mx-0 sm:p-6")}>
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
          isExpandedMobileCapture && "rounded-[1.75rem] border-medium_slate_blue-700 bg-soft_periwinkle-900 p-3",
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
            {shouldUseMobileStudio ? (
              <div className="rounded-2xl border border-medium_slate_blue-700 bg-soft_periwinkle-900 px-4 py-5 text-left md:hidden">
                <p className="text-sm font-medium text-charcoal-300">Capture studio is open</p>
                <p className="mt-1 text-sm text-grey-500">Use the full-screen capture view to frame, record, and manage this rep.</p>
              </div>
            ) : (
              <>
                {renderPreviewSurface()}
                {renderSelectionMeta()}
                {renderActionButtons()}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {renderFilmingGuide()}
            <div className="flex flex-col items-center gap-4 py-3 text-center">
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
                <Button type="button" variant="secondary" onClick={handleOpenLibrary} className="w-full sm:w-auto">
                  <UploadSimpleIcon size={18} />
                  {uploadLabel}
                </Button>
                <Button type="button" variant="ghost" onClick={() => void handleOpenCamera()} className="w-full sm:w-auto">
                  <CameraIcon size={18} />
                  {isMobileDevice ? "Use cellphone camera" : "Use laptop camera"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error ? <Badge variant="error">{error}</Badge> : null}
      </Card>

      {shouldUseMobileStudio ? (
        <div className="fixed inset-0 z-[70] bg-white_smoke-500 md:hidden">
          <div
            className="flex h-full flex-col overflow-hidden overscroll-none px-4"
            style={{
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex items-start justify-between gap-4 pb-4">
              <div className="space-y-1">
                <Badge variant="brand">{hasStream ? "Camera live" : value.url ? "Rep selected" : "Capture studio"}</Badge>
                <div>
                  <h3 className="text-xl font-medium text-charcoal-200">Capture your rep</h3>
                  <p className="text-sm text-grey-500">Use a full-screen view to frame, record, and confirm the exact clip you want analyzed.</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleDismissMobileStudio} className="shrink-0">
                <XIcon size={18} />
                Close
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              {value.url || hasStream ? (
                <>
                  {renderPreviewSurface(true)}
                  {renderSelectionMeta(true)}
                </>
              ) : (
                <>
                  {renderFilmingGuide(true)}
                  <div className="flex flex-1 items-center justify-center rounded-[1.75rem] border border-dashed border-medium_slate_blue-700 bg-soft_periwinkle-900 px-6 text-center">
                    <div className="space-y-2">
                      <p className="text-base font-medium text-charcoal-300">Choose how you want to capture this set</p>
                      <p className="text-sm text-grey-500">Open the rear camera for a fresh rep, or pick a clip from your library and review it here.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 space-y-3 rounded-[1.75rem] border border-silver-800 bg-white p-4">
              {renderActionButtons(true)}
              {value.url && !hasStream ? (
                <Button type="button" size="lg" onClick={() => setIsMobileStudioOpen(false)} className="w-full">
                  Keep this rep
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
