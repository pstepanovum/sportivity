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
const FILMING_BANNER =
  "Best results: film from the side, keep your full body visible, and keep the phone around hip height.";

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
  // Library file picker — no capture attribute so it opens the file library
  const inputRef = useRef<HTMLInputElement>(null);
  // Native camera input — capture="environment" opens the phone's rear camera directly
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const previousUrlRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinishingRecord, setIsFinishingRecord] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isMobileStudioOpen, setIsMobileStudioOpen] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  const { attachStream, hasStream, isRecording, startCamera, stopCamera, startRecording, stopRecording } = useVideoCapture();

  const cameraLabel = isMobileDevice ? "cellphone camera" : "laptop camera";
  const previewLabel = isMobileDevice ? "Live cellphone camera preview" : "Live laptop camera preview";
  const shouldUseMobileStudio = isMobileDevice && isMobileStudioOpen;
  // On mobile we use native capture, so isExpandedMobileCapture only applies to desktop webcam flow
  const isExpandedMobileCapture = !isMobileDevice && hasStream;
  const controlButtonSize = isExpandedMobileCapture ? "lg" : "sm";
  const selectedRepLabel = value.file?.name ?? (hasStream ? previewLabel : value.url ? "Selected rep" : "No rep selected");
  const selectedRepMeta = value.duration
    ? `${formatDuration(value.duration)} duration`
    : hasStream
      ? isRecording
        ? `Recording from your ${cameraLabel}`
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
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Video must be 100MB or smaller.");
        return;
      }

      stopCamera(videoRef.current);
      setError(null);
      const url = URL.createObjectURL(file);
      setSelection({ file, url, duration: null });
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
        await applyFile(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record video.");
      debugError("videoUploader", "Record toggle failed", err);
      stopCamera(videoRef.current);
    } finally {
      setIsFinishingRecord(false);
    }
  };

  // Desktop: starts in-browser webcam stream.
  // Mobile: opens native camera via the cameraInputRef (no in-browser stream needed).
  const handleOpenCamera = async () => {
    if (isMobileDevice) {
      setIsMobileStudioOpen(true);
      // Small delay so the modal renders before the native camera sheet appears
      setTimeout(() => cameraInputRef.current?.click(), 50);
      return;
    }

    try {
      setError(null);
      setSelection({ file: null, url: null, duration: null });
      setIsFrontCamera(true);
      debugClientEvent("videoUploader", "Opening desktop camera flow");
      await startCamera({ facingMode: "user", videoElement: videoRef.current });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to start the ${cameraLabel}.`);
      debugError("videoUploader", "Failed to open camera", err);
      stopCamera(videoRef.current);
    }
  };

  const handleCloseCamera = () => {
    stopCamera(videoRef.current);
  };

  // Opens the library file picker. On mobile this also opens the studio so the
  // user lands on the preview screen after picking a clip.
  const handleOpenLibrary = () => {
    if (isMobileDevice) {
      setIsMobileStudioOpen(true);
    }
    setTimeout(() => inputRef.current?.click(), 50);
  };

  const handleSwapToLibrary = () => {
    stopCamera(videoRef.current);
    handleOpenLibrary();
  };

  const handleDismissMobileStudio = () => {
    debugClientEvent("videoUploader", "Closing mobile capture studio");
    stopCamera(videoRef.current);
    setIsMobileStudioOpen(false);
  };

  const clearSelection = () => {
    stopCamera(videoRef.current);
    setError(null);
    setSelection({ file: null, url: null, duration: null });

    if (inputRef.current) inputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (isMobileDevice) setIsMobileStudioOpen(false);
  };

  useEffect(
    () => () => {
      revokeUrl(previousUrlRef.current);
    },
    [revokeUrl],
  );

  useEffect(() => {
    if (!hasStream) return;
    debugClientEvent("videoUploader", "Detected active stream; attaching preview element");
    void attachStream(videoRef.current);
  }, [attachStream, hasStream, videoRef]);

  useEffect(() => {
    if (typeof document === "undefined" || !shouldUseMobileStudio) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldUseMobileStudio]);

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderPreviewSurface = (isFullscreen = false) => (
    <div
      className={cn(
        "overflow-hidden",
        isFullscreen
          ? "flex-1 min-h-0 bg-charcoal-100"
          : cn(
              "rounded-2xl border border-silver-800 bg-charcoal-100",
              isExpandedMobileCapture && "rounded-[1.5rem] border-medium_slate_blue-700",
            ),
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
          "w-full",
          isFullscreen
            ? "h-full object-contain"
            : isExpandedMobileCapture
              ? "aspect-[4/5] min-h-[420px] object-cover"
              : "max-h-[50vh] object-contain",
        )}
        style={hasStream && isFrontCamera ? { transform: "scaleX(-1)" } : undefined}
        onLoadedMetadata={() => {
          const duration = videoRef.current?.duration ?? null;
          onChange({ ...value, duration: Number.isFinite(duration) ? duration : null });
        }}
      />
    </div>
  );

  const renderSelectionMeta = (isFullscreen = false) => (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        isExpandedMobileCapture && "rounded-[1.5rem] bg-white p-4",
        isFullscreen && "border-t border-silver-800 bg-white px-4 py-3",
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

  // Desktop card action buttons (non-fullscreen) — supports both stream and no-stream states.
  // Mobile modal action buttons (fullscreen) — mobile never has hasStream, so always no-stream branch.
  const renderActionButtons = (isFullscreen = false) => (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap", isFullscreen && "gap-3")}>
      {hasStream ? (
        // Desktop webcam recording controls
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
            size="sm"
            onClick={handleSwapToLibrary}
            className="w-full justify-center"
          >
            <UploadSimpleIcon size={18} />
            Use uploaded clip
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCloseCamera}
            className="w-full justify-center"
          >
            <XIcon size={18} />
            Turn camera off
          </Button>
        </>
      ) : isFullscreen ? (
        // Mobile studio: Open Camera (native) first, then library
        <>
          <Button
            type="button"
            size="lg"
            onClick={() => void handleOpenCamera()}
            className="w-full justify-center"
          >
            <CameraIcon size={18} />
            Open camera
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleOpenLibrary}
            className="w-full justify-center"
          >
            <UploadSimpleIcon size={18} />
            {value.url ? "Choose another clip" : "Use phone library"}
          </Button>
          {value.url ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={clearSelection}
              className="w-full justify-center"
            >
              <XIcon size={18} />
              Delete rep
            </Button>
          ) : null}
        </>
      ) : (
        // Desktop card: library first, then camera
        <>
          <Button
            type="button"
            variant="secondary"
            size={controlButtonSize}
            onClick={handleOpenLibrary}
            className="w-full justify-center"
          >
            <UploadSimpleIcon size={18} />
            {value.url ? "Replace" : "Choose file"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={controlButtonSize}
            onClick={() => void handleOpenCamera()}
            className="w-full justify-center"
          >
            <CameraIcon size={18} />
            Use laptop camera
          </Button>
          {value.url ? (
            <Button
              type="button"
              variant="ghost"
              size={controlButtonSize}
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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Hidden file inputs */}
      {/* Library input — no capture, opens the file picker / photo library */}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      {/* Camera input — capture="environment" opens the native rear camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        capture="environment"
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <Card className={cn("space-y-4", isExpandedMobileCapture && "-mx-4 rounded-[2rem] p-4 sm:mx-0 sm:p-6")}>
        <div className="space-y-1">
          <h3 className="text-base font-medium text-charcoal-300">Upload or record your set</h3>
          <p className="text-sm text-grey-500">
            {isMobileDevice
              ? "Use your phone library, or open the rear camera and record one clean rep."
              : "Drop a clip, choose a file, or record one rep directly from your camera."}
          </p>
        </div>

        <div
          role="presentation"
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
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
          {value.url || hasStream ? (
            <div className="space-y-4">
              {shouldUseMobileStudio ? (
                <div className="rounded-2xl border border-medium_slate_blue-700 bg-soft_periwinkle-900 px-4 py-5 text-left">
                  <p className="text-sm font-medium text-charcoal-300">Capture studio is open</p>
                  <p className="mt-1 text-sm text-grey-500">Use the full-screen view to record or pick your clip.</p>
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
            <div className="space-y-4 py-2">
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
                    {isMobileDevice ? "Use phone library" : "Choose file"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void handleOpenCamera()} className="w-full sm:w-auto">
                    <CameraIcon size={18} />
                    {isMobileDevice ? "Open camera" : "Use laptop camera"}
                  </Button>
                </div>
              </div>
              <p className="text-center text-sm text-grey-500">{FILMING_BANNER}</p>
            </div>
          )}
        </div>

        {error ? <Badge variant="error">{error}</Badge> : null}
      </Card>

      {/* Mobile fullscreen capture studio */}
      {shouldUseMobileStudio ? (
        <div
          className="fixed inset-0 z-[100] flex h-dvh w-screen flex-col overflow-hidden overscroll-none bg-white_smoke-500 md:hidden"
          style={{ touchAction: "none" }}
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-start justify-between gap-4 border-b border-silver-800 bg-white_smoke-500 px-4 pb-4"
            style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
          >
            <div className="space-y-2">
              <Badge variant="brand">{value.url ? "Rep selected" : "Capture studio"}</Badge>
              <div className="space-y-1">
                <h3 className="text-xl font-medium text-charcoal-200">Capture your rep</h3>
                <p className="text-sm text-grey-500">Record with the rear camera or pick a saved clip.</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleDismissMobileStudio} className="shrink-0">
              <XIcon size={18} />
              Close
            </Button>
          </div>

          {/* Middle — video preview when clip is selected, empty state otherwise */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {value.url ? (
              <>
                {renderPreviewSurface(true)}
                {renderSelectionMeta(true)}
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div className="space-y-2">
                  <p className="text-base font-medium text-charcoal-300">No clip selected yet</p>
                  <p className="text-sm text-grey-500">
                    Open the rear camera to record a fresh rep, or pick an existing clip from your library.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div
            className="shrink-0 space-y-3 border-t border-silver-800 bg-white px-4 pt-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {renderActionButtons(true)}
            {value.url ? (
              <Button type="button" size="lg" onClick={() => setIsMobileStudioOpen(false)} className="w-full">
                Keep this rep
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
