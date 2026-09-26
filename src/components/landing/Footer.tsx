import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="prism-text font-display text-sm font-semibold">Forge</span>
        <p className="text-xs text-graphite">
          &copy; {new Date().getFullYear()} Forge. Your business identity, in one scan.
        </p>
        <Link href="/login" className="text-xs text-graphite hover:text-ink transition-colors">
          Log in
        </Link>
      </div>
    </footer>
  );
}
