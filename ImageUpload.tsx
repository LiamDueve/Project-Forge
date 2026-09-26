"use client";

import { useRef, useState } from "react";
import { CropModal } from "@/components/dashboard/CropModal";

export function ImageUpload({
  label,
  previewUrl,
  onFileSelected,
  shape = "square",
  aspect,
}: {
  label: string;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  shape?: "square" | "circle";
  aspect?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const cropAspect = aspect || (shape === "circle" ? 1 : 2.2);
  const outW = shape === "circle" ? 600 : 900;
  const outH = shape === "circle" ? 600 : Math.round(900 / cropAspect);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`focus-ring flex items-center justify-center overflow-hidden border border-dashed border-line bg-white text-xs text-graphite transition-colors hover:border-ink/40 ${
          shape === "circle" ? "h-24 w-24 rounded-full" : "rounded-2xl"
        }`}
        style={shape === "circle" ? undefined : { width: 168, aspectRatio: `${cropAspect}` }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          "Upload"
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPendingFile(file);
          e.target.value = "";
        }}
      />
      <CropModal
        file={pendingFile}
        shape={shape === "circle" ? "circle" : "rect"}
        aspect={cropAspect}
        outW={outW}
        outH={outH}
        onCancel={() => setPendingFile(null)}
        onConfirm={(croppedFile) => {
          onFileSelected(croppedFile);
          setPendingFile(null);
        }}
      />
    </div>
  );
}
