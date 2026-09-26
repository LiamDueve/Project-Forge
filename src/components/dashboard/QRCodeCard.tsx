"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/Button";

export function QRCodeCard({ profileUrl }: { profileUrl: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  function handleDownload() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "forge-qr-code.png";
    link.click();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card p-6">
      <h3 className="font-display text-lg font-semibold text-ink">Your QR code</h3>
      <p className="mt-1 text-sm text-graphite">Scan to open your public profile.</p>
      <div ref={wrapperRef} className="mt-5 flex justify-center rounded-2xl border border-line bg-white p-6">
        <QRCodeCanvas value={profileUrl} size={180} bgColor="#FFFFFF" fgColor="#0A0A0A" level="M" />
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" className="flex-1" onClick={handleDownload}>
          Download PNG
        </Button>
        <Button variant="secondary" className="flex-1" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
