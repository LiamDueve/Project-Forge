"use client";

import { useState } from "react";

export function ProfilePhoto({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  const [open, setOpen] = useState(false);
  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <>
      <button
        type="button"
        onClick={() => photoUrl && setOpen(true)}
        className="focus-ring block rounded-full"
        style={{ width: 88, height: 88 }}
        aria-label={photoUrl ? "View photo" : undefined}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            className="h-full w-full rounded-full border-4 border-paper object-cover shadow-card"
          />
        ) : (
          <div className="font-display flex h-full w-full items-center justify-center rounded-full border-4 border-paper bg-ink text-2xl font-bold text-paper shadow-card">
            {initial}
          </div>
        )}
      </button>

      {open && photoUrl && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/85 p-6"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={name}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white hover:bg-white/20"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
