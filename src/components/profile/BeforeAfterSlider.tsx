"use client";

import { useRef, useState } from "react";

export function BeforeAfterSlider({
  before,
  after,
  caption,
}: {
  before: string;
  after: string;
  caption?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const draggingRef = useRef(false);

  function updateFromClientX(clientX: number) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let p = ((clientX - rect.left) / rect.width) * 100;
    p = Math.max(0, Math.min(100, p));
    setPct(p);
  }
  function onDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    ref.current?.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  }
  function onUp() {
    draggingRef.current = false;
  }

  return (
    <figure className="m-0">
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative w-full touch-none select-none overflow-hidden rounded-[18px] border border-line"
        style={{ aspectRatio: "4 / 3", cursor: "ew-resize" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt="After" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before} alt="Before" draggable={false} className="pointer-events-none h-full w-full object-cover" />
        </div>
        <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/65 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white">
          Before
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-ink/65 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white">
          After
        </span>
        <div
          className="pointer-events-none absolute bottom-0 top-0 w-[3px] bg-white"
          style={{ left: `${pct}%`, transform: "translateX(-50%)", boxShadow: "0 0 0 1px rgba(10,10,10,0.15)" }}
        />
        <div
          className="prism-ring pointer-events-none absolute flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-card"
          style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%,-50%)" }}
        >
          <i className="fa-solid fa-arrows-left-right text-sm" />
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-sm text-graphite">{caption}</figcaption>}
    </figure>
  );
}
