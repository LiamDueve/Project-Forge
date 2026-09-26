const steps = [
  {
    n: "01",
    title: "Build your profile",
    body: "Add your company, services, portfolio photos, and every way people can reach you.",
  },
  {
    n: "02",
    title: "Get your QR code",
    body: "Forge generates a unique link and QR code the moment your profile goes live.",
  },
  {
    n: "03",
    title: "Share your business instantly",
    body: "Print it on a card, add it to your truck, or send the link — one scan says it all.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="font-display max-w-xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Three steps from job site to handshake.
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <div key={step.n} className="relative">
              <span className="font-display text-sm font-semibold text-graphite/50">{step.n}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">{step.body}</p>
              {i < steps.length - 1 && (
                <div className="mt-8 hidden h-px w-full bg-line md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
