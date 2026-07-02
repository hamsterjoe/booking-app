"use client";

import { useEffect, useId, useState } from "react";

type ProfileAvatarInputProps = {
  name: string;
  avatarUrl?: string | null;
  displayName: string;
  email?: string | null;
};

function getInitials(displayName: string, email?: string | null) {
  const source = displayName.trim() || email || "Picko";

  const parts = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "P"
  );
}

export function ProfileAvatarInput({
  name,
  avatarUrl,
  displayName,
  email,
}: ProfileAvatarInputProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-2xl shadow-black/30 ring-4 ring-white/10">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Profile avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl font-black text-white">
              {getInitials(displayName, email)}
            </span>
          )}
        </div>

        <label
          htmlFor={inputId}
          className="absolute bottom-1 right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white text-lg font-black text-slate-950 shadow-lg shadow-black/25 transition hover:scale-105 hover:bg-lime-200"
          aria-label="Upload profile picture"
        >
          +
        </label>
      </div>

      <input
        id={inputId}
        name={name}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          const nextPreviewUrl = URL.createObjectURL(file);
          setPreviewUrl((currentPreviewUrl) => {
            if (currentPreviewUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(currentPreviewUrl);
            }

            return nextPreviewUrl;
          });
        }}
      />

      <p className="mt-4 text-sm font-semibold text-white">
        {displayName || "Your profile picture"}
      </p>

      <p className="mt-1 text-xs text-white/45">
        Upload any image and it will be automatically cropped into a circle.
      </p>
    </div>
  );
}