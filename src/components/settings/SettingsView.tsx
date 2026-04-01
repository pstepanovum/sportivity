// FILE: src/components/settings/SettingsView.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { SpeakerHighIcon } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";

import { COACH_STYLES, COACH_VOICES, resolveCoachStyle, resolveCoachVoice } from "@/lib/openai/voice";
import { Avatar, Badge, Button, Card, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { CoachStyle, CoachVoice, CoachVoiceFeedback } from "@/types/analysis";

interface SettingsViewProps {
  initialAvatarUrl: string | null;
  initialCoachStyle?: CoachStyle;
  initialCoachVoice?: CoachVoice;
  initialEmail: string;
  initialName: string | null;
  userId: string;
}

async function fileToAvatarDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();

      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Unable to read the selected image."));
      nextImage.src = objectUrl;
    });

    const sourceSize = Math.min(image.width, image.height);
    const sourceX = (image.width - sourceSize) / 2;
    const sourceY = (image.height - sourceSize) / 2;
    const canvas = document.createElement("canvas");

    canvas.width = 320;
    canvas.height = 320;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare the avatar preview.");
    }

    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function SettingsView({
  initialAvatarUrl,
  initialCoachStyle,
  initialCoachVoice,
  initialEmail,
  initialName,
  userId,
}: SettingsViewProps) {
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewRequestRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [coachStyle, setCoachStyle] = useState<CoachStyle>(resolveCoachStyle(initialCoachStyle));
  const [coachVoice, setCoachVoice] = useState<CoachVoice>(resolveCoachVoice(initialCoachVoice));
  const [name, setName] = useState(initialName ?? "");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [savedCoachStyle, setSavedCoachStyle] = useState<CoachStyle>(resolveCoachStyle(initialCoachStyle));
  const [savedCoachVoice, setSavedCoachVoice] = useState<CoachVoice>(resolveCoachVoice(initialCoachVoice));
  const [savedName, setSavedName] = useState(initialName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [voicePreview, setVoicePreview] = useState<CoachVoiceFeedback | null>(null);
  const [voicePreviewError, setVoicePreviewError] = useState<string | null>(null);
  const [voicePreviewKey, setVoicePreviewKey] = useState<string | null>(null);

  const normalizedName = name.trim();
  const isDirty =
    normalizedName !== savedName.trim() ||
    avatarUrl !== savedAvatarUrl ||
    coachVoice !== savedCoachVoice ||
    coachStyle !== savedCoachStyle;
  const currentPreviewKey = `${coachVoice}:${coachStyle}:${normalizedName || initialEmail}`;
  const previewAudioUrl = useMemo(() => {
    if (!voicePreview) return null;
    return `data:${voicePreview.mimeType};base64,${voicePreview.audioBase64}`;
  }, [voicePreview]);

  const fetchVoicePreview = async (previewKey: string) => {
    const requestId = ++previewRequestRef.current;

    try {
      setIsPreviewLoading(true);

      const response = await fetch("/api/coach-audio-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          style: coachStyle,
          voice: coachVoice,
          fullName: normalizedName || initialEmail,
        }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | CoachVoiceFeedback | null;

      if (!response.ok) {
        const errorMessage = body && "error" in body ? body.error ?? "Unable to preview this voice." : "Unable to preview this voice.";
        throw new Error(errorMessage);
      }

      if (previewRequestRef.current !== requestId) {
        return null;
      }

      const preview = body as CoachVoiceFeedback;
      setVoicePreview(preview);
      setVoicePreviewKey(previewKey);
      setVoicePreviewError(null);

      return preview;
    } catch (err) {
      if (previewRequestRef.current === requestId) {
        setVoicePreviewError(err instanceof Error ? err.message : "Unable to preview this voice.");
      }
      return null;
    } finally {
      if (previewRequestRef.current === requestId) {
        setIsPreviewLoading(false);
      }
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (voicePreviewKey !== currentPreviewKey) {
        void fetchVoicePreview(currentPreviewKey);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [currentPreviewKey]);

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setSuccess(null);

    if (!file.type.startsWith("image/")) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setError("Use an image under 6MB.");
      event.target.value = "";
      return;
    }

    try {
      setIsPreparingImage(true);
      const nextAvatarUrl = await fileToAvatarDataUrl(file);
      setAvatarUrl(nextAvatarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to prepare the selected image.");
    } finally {
      setIsPreparingImage(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    setError(null);
    setSuccess(null);
  };

  const handleTestVoice = async () => {
    const element = previewAudioRef.current;

    if (isPreviewPlaying && element) {
      element.pause();
      setIsPreviewPlaying(false);
      return;
    }

    if (voicePreview && voicePreviewKey === currentPreviewKey && element) {
      try {
        element.currentTime = 0;
        await element.play();
        setIsPreviewPlaying(true);
        setVoicePreviewError(null);
        return;
      } catch {
        setVoicePreviewError("Unable to play the selected voice preview.");
        return;
      }
    }

    if (isPreviewLoading) {
      return;
    }

    const preview = await fetchVoicePreview(currentPreviewKey);

    if (!preview || !element) {
      return;
    }

    try {
      element.currentTime = 0;
      await element.play();
      setIsPreviewPlaying(true);
      setVoicePreviewError(null);
    } catch {
      setVoicePreviewError("Voice demo is still getting ready. Tap once more in a moment.");
    }
  };

  const handleSave = async () => {
    const supabase = createClient();

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        avatar_url: avatarUrl,
        full_name: normalizedName || null,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          coach_style: coachStyle,
          coach_voice: coachVoice,
          full_name: normalizedName || null,
        },
      });

      if (authError) {
        throw authError;
      }

      setSavedAvatarUrl(avatarUrl);
      setSavedCoachStyle(coachStyle);
      setSavedCoachVoice(coachVoice);
      setSavedName(normalizedName);
      setSuccess("Profile updated.");

      window.dispatchEvent(
        new CustomEvent("sportivity:profile-updated", {
          detail: {
            avatarUrl,
            name: normalizedName || initialEmail,
          },
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge variant="brand">Account settings</Badge>
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-charcoal-200">Settings</h1>
            <p className="text-sm text-grey-500">Upload a profile photo, keep your display name current, and make the app feel more personal.</p>
          </div>
        </div>
      </div>

      {error ? <Badge variant="error">{error}</Badge> : null}
      {success ? <Badge variant="brand">{success}</Badge> : null}

      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-charcoal-300">Profile preview</h2>
            <p className="text-sm text-grey-500">This image replaces the initials circle in the app navbar after you save.</p>
          </div>

          <div className="rounded-[1.75rem] border border-silver-800 bg-white_smoke-800 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar name={normalizedName || initialEmail} src={avatarUrl} className="h-24 w-24 text-2xl" />
              <div className="space-y-1">
                <p className="text-base font-medium text-charcoal-300">{normalizedName || "Sportivity athlete"}</p>
                <p className="text-sm text-grey-500">{initialEmail}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-silver-800 bg-white p-4">
            <p className="text-sm font-medium text-charcoal-300">Photo tips</p>
            <p className="mt-2 text-sm text-grey-500">Square images work best. We crop the image to a centered square and save a lightweight version for faster loading.</p>
          </div>
        </Card>

        <Card className="space-y-5">
          <audio
            ref={previewAudioRef}
            src={previewAudioUrl ?? undefined}
            className="hidden"
            onEnded={() => setIsPreviewPlaying(false)}
            onPause={() => setIsPreviewPlaying(false)}
            onPlay={() => setIsPreviewPlaying(true)}
          />

          <div className="space-y-1">
            <h2 className="text-xl font-medium text-charcoal-300">Profile details</h2>
            <p className="text-sm text-grey-500">Update the name and photo that show up throughout your Sportivity account.</p>
          </div>

          <div className="grid gap-4">
            <Input
              label="Display name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
                setSuccess(null);
                setVoicePreview(null);
                setVoicePreviewError(null);
                setVoicePreviewKey(null);
              }}
              placeholder="Your name"
            />

            <Input label="Email" value={initialEmail} disabled />

            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-charcoal-300">Profile photo</p>
                  <p className="text-sm text-grey-500">JPG, PNG, or WebP up to 6MB.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleChoosePhoto}
                    loading={isPreparingImage}
                  >
                    <UploadSimpleIcon size={18} />
                    Upload photo
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemovePhoto}
                    disabled={!avatarUrl}
                  >
                    <TrashIcon size={18} />
                    Remove photo
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => void handleFileChange(event)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-charcoal-300">Coach vibe</p>
                  <p className="text-sm text-grey-500">Choose how your coach talks to you after each analysis.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {COACH_STYLES.map((styleOption) => {
                    const isActive = coachStyle === styleOption.id;

                    return (
                      <button
                        key={styleOption.id}
                        type="button"
                        onClick={() => {
                          setCoachStyle(styleOption.id);
                          setError(null);
                          setSuccess(null);
                          setVoicePreview(null);
                          setVoicePreviewError(null);
                          setVoicePreviewKey(null);
                        }}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          isActive
                            ? "border-medium_slate_blue-500 bg-medium_slate_blue-900"
                            : "border-silver-800 bg-white hover:border-silver-700"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-charcoal-300">{styleOption.label}</p>
                          <p className="text-sm text-grey-500">{styleOption.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-silver-800 bg-white_smoke-800 p-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-charcoal-300">Coach voice</p>
                  <p className="text-sm text-grey-500">Choose the OpenAI voice used after each analysis.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {COACH_VOICES.map((voiceOption) => {
                    const isActive = coachVoice === voiceOption.id;

                    return (
                      <button
                        key={voiceOption.id}
                        type="button"
                        onClick={() => {
                          setCoachVoice(voiceOption.id);
                          setError(null);
                          setSuccess(null);
                          setVoicePreview(null);
                          setVoicePreviewError(null);
                          setVoicePreviewKey(null);
                        }}
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          isActive
                            ? "border-medium_slate_blue-500 bg-medium_slate_blue-900"
                            : "border-silver-800 bg-white hover:border-silver-700"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="inline-flex rounded-full bg-white_smoke-800 p-2 text-medium_slate_blue-500">
                            <SpeakerHighIcon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal-300">{voiceOption.label}</p>
                            <p className="mt-1 text-sm text-grey-500">{voiceOption.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" onClick={() => void handleTestVoice()} loading={isPreviewLoading}>
                    {isPreviewPlaying ? <PauseIcon size={18} /> : <SpeakerHighIcon size={18} />}
                    {isPreviewPlaying ? "Pause demo" : "Hear voice demo"}
                  </Button>
                </div>

                {voicePreviewError ? <Badge variant="error">{voicePreviewError}</Badge> : null}

                {voicePreview ? (
                  <div className="rounded-2xl border border-silver-800 bg-white p-4">
                    <p className="text-sm font-medium text-charcoal-300">Sample line</p>
                    <p className="mt-2 text-sm text-grey-500">{voicePreview.script}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleSave()} disabled={!isDirty || isPreparingImage} loading={isSaving}>
              Save changes
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={!isDirty || isSaving}
              onClick={() => {
                setAvatarUrl(savedAvatarUrl);
                setCoachStyle(savedCoachStyle);
                setCoachVoice(savedCoachVoice);
                setName(savedName);
                setError(null);
                setSuccess(null);
              }}
            >
              <ArrowClockwiseIcon size={18} />
              Reset edits
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
