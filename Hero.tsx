import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 md:pb-32 md:pt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-5">Digital business identity</p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Your entire business identity in one scan.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-graphite">
            Create a premium digital profile with your portfolio, services, reviews, and
            contact info — then share it instantly with a QR code or link.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <LinkButton href="/signup" className="text-base">
              Create Your Profile
            </LinkButton>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div className="tilt-in relative w-[248px] xs:w-[280px] sm:w-[320px]">
            {/* Physical card, behind */}
            <div className="absolute -left-6 top-9 h-[156px] w-[248px] rounded-2xl border border-line bg-white shadow-card xs:-left-8 xs:top-10 xs:h-[176px] xs:w-[280px]">
              <div className="flex h-full flex-col justify-between p-4 xs:p-5">
                <div className="h-2 w-16 rounded-full bg-ink/10" />
                <div>
                  <div className="mb-1 h-2.5 w-24 rounded-full bg-ink/80" />
                  <div className="h-2 w-32 rounded-full bg-ink/20" />
                </div>
              </div>
              <div className="absolute right-4 top-4 h-7 w-7 rounded-md border-2 border-ink/15 xs:right-5 xs:top-5 xs:h-8 xs:w-8" />
            </div>

            {/* Phone showing public profile, front */}
            <div className="relative ml-16 rounded-[28px] border border-line bg-white p-2 shadow-card xs:ml-20">
              <div className="relative overflow-hidden rounded-[20px] bg-paper">
                <div className="scanline absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-ink/10 to-transparent" />
                <div className="space-y-4 p-5 pt-8">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-ink" />
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-24 rounded-full bg-ink/80" />
                      <div className="h-2 w-16 rounded-full bg-ink/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="col-span-1 h-8 rounded-lg bg-ink" />
                    <div className="col-span-1 h-8 rounded-lg bg-ink/10" />
                    <div className="col-span-1 h-8 rounded-lg bg-ink/10" />
                    <div className="col-span-1 h-8 rounded-lg bg-ink/10" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="aspect-square rounded-lg bg-ink/10" />
                    <div className="aspect-square rounded-lg bg-ink/10" />
                    <div className="aspect-square rounded-lg bg-ink/10" />
                  </div>
                </div>
              </div>
            </div>

            {/* QR chip, overlapping both */}
            <div className="prism-ring absolute -right-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-xl border border-line bg-ink shadow-card sm:-right-6">
              <svg viewBox="0 0 7 7" className="h-8 w-8" fill="#FAFAFA">
                <rect x="0" y="0" width="2" height="2" />
                <rect x="0" y="3" width="1" height="1" />
                <rect x="0" y="5" width="2" height="2" />
                <rect x="3" y="0" width="1" height="1" />
                <rect x="5" y="0" width="2" height="2" />
                <rect x="3" y="3" width="1" height="1" />
                <rect x="5" y="3" width="1" height="1" />
                <rect x="3" y="5" width="2" height="2" />
                <rect x="6" y="3" width="1" height="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
