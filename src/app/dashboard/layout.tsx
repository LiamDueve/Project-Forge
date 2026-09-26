import Link from "next/link";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/dashboard" className="prism-text font-display shrink-0 text-lg font-bold tracking-tight">
            Forge
          </Link>
          <nav className="no-scrollbar flex min-w-0 items-center gap-4 overflow-x-auto sm:gap-6">
            <Link
              href="/dashboard"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-graphite transition-colors hover:text-ink"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-graphite transition-colors hover:text-ink"
            >
              Edit Profile
            </Link>
            <Link
              href="/dashboard/contact-card"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-graphite transition-colors hover:text-ink"
            >
              Contact Card
            </Link>
            <Link
              href="/dashboard/projects"
              className="shrink-0 whitespace-nowrap text-sm font-medium text-graphite transition-colors hover:text-ink"
            >
              Projects
            </Link>
            <span className="shrink-0">
              <LogoutButton />
            </span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
