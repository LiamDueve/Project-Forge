import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="prism-text font-display text-lg font-bold tracking-tight">
          Forge
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-graphite hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#who-its-for" className="text-sm text-graphite hover:text-ink transition-colors">
            Who it&apos;s for
          </a>
          <a href="#features" className="text-sm text-graphite hover:text-ink transition-colors">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-ink hover:text-graphite transition-colors sm:block">
            Log in
          </Link>
          <LinkButton href="/signup" className="!px-5 !py-2 text-sm">
            Create Your Profile
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
