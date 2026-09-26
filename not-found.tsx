import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        This profile doesn&apos;t exist yet.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-graphite">
        The link or QR code you followed may be mistyped, or the profile hasn&apos;t been
        published.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink/85 transition-colors"
      >
        Go to Forge
      </Link>
    </main>
  );
}
