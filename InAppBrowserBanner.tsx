export function InAppBrowserBanner({ appName }: { appName: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
      <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-amber-500" />
      <p className="text-sm leading-snug text-amber-900">
        <span className="font-semibold">You're viewing this inside {appName}.</span> Some features like{" "}
        <span className="font-semibold">Save Contact</span> may not work here. Tap{" "}
        <span className="font-semibold">••• (or the share icon)</span> above and choose{" "}
        <span className="font-semibold">&quot;Open in Browser&quot;</span> for the full experience.
      </p>
    </div>
  );
}
