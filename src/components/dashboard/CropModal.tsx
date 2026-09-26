"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
  SyntheticEvent,
} from "react";
import { Button } from "@/components/ui/Button";

type Offset = { x: number; y: number };

export function CropModal({
  file,
  shape,
  aspect,
  outW,
  outH,
  onCancel,
  onConfirm,
}: {
  file: File | null;
  shape: "circle" | "rect";
  aspect: number;
  outW: number;
  outH: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const imgElRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const VW = 280;
  const VH = Math.round(VW / aspect);

  useEffect(() => {
    if (!file) {
      setImgUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setZoom(1);
    setNatural({ w: 0, h: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file || !imgUrl) return null;
  const safeFile = file; // captured as a local const so TS retains the non-null narrowing inside nested closures below

  const baseScale = natural.w ? Math.max(VW / natural.w, VH / natural.h) : 1;
  const scale = baseScale * zoom;
  const dW = natural.w * scale;
  const dH = natural.h * scale;

  function clamp(px: number, py: number, w: number, h: number): Offset {
    const minX = Math.min(0, VW - w);
    const minY = Math.min(0, VH - h);
    return { x: Math.min(0, Math.max(minX, px)), y: Math.min(0, Math.max(minY, py)) };
  }

  function onImgLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const bScale = Math.max(VW / naturalWidth, VH / naturalHeight);
    const w = naturalWidth * bScale;
    const h = naturalHeight * bScale;
    setNatural({ w: naturalWidth, h: naturalHeight });
    setOffset({ x: (VW - w) / 2, y: (VH - h) / 2 });
  }

  function point(e: ReactPointerEvent) {
    return e;
  }
  function handleDown(e: ReactPointerEvent<HTMLDivElement>) {
    const p = point(e);
    dragRef.current = { startX: p.clientX, startY: p.clientY, origX: offset.x, origY: offset.y };
  }
  function handleMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const p = point(e);
    const dx = p.clientX - dragRef.current.startX;
    const dy = p.clientY - dragRef.current.startY;
    setOffset(clamp(dragRef.current.origX + dx, dragRef.current.origY + dy, dW, dH));
  }
  function handleUp() {
    dragRef.current = null;
  }

  function handleZoom(e: ChangeEvent<HTMLInputElement>) {
    const newZoom = parseFloat(e.target.value);
    const cx = (VW / 2 - offset.x) / scale;
    const cy = (VH / 2 - offset.y) / scale;
    const newScale = baseScale * newZoom;
    const newW = natural.w * newScale;
    const newH = natural.h * newScale;
    const px = VW / 2 - cx * newScale;
    const py = VH / 2 - cy * newScale;
    setZoom(newZoom);
    setOffset(clamp(px, py, newW, newH));
  }

  function handleConfirm() {
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imgElRef.current) return;
    const sourceX = (0 - offset.x) / scale;
    const sourceY = (0 - offset.y) / scale;
    const sourceW = VW / scale;
    const sourceH = VH / scale;
    ctx.drawImage(imgElRef.current, sourceX, sourceY, sourceW, sourceH, 0, 0, outW, outH);
    const originalName = safeFile.name;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], originalName.replace(/\.\w+$/, "") + "-cropped.jpg", {
          type: "image/jpeg",
        });
        onConfirm(croppedFile);
      },
      "image/jpeg",
      0.88
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/60 p-5">
      <div className="card w-full max-w-[340px] p-6">
        <h3 className="font-display text-base font-semibold text-ink">Crop your image</h3>
        <p className="mb-4 mt-1 text-sm text-graphite">Drag to reposition, use the slider to zoom.</p>
        <div
          className={`relative mx-auto overflow-hidden border border-line bg-neutral-200 ${
            shape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
          style={{ width: VW, height: VH, cursor: "grab", touchAction: "none" }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgElRef}
            src={imgUrl}
            onLoad={onImgLoad}
            draggable={false}
            alt=""
            className="absolute select-none"
            style={{ left: offset.x, top: offset.y, width: dW || VW, height: dH || VH, maxWidth: "none" }}
          />
        </div>
        <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={handleZoom} className="mt-4 w-full" />
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="prism-glow flex-1" onClick={handleConfirm}>
            Apply crop
          </Button>
        </div>
      </div>
    </div>
  );
}
