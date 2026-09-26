const features = [
  { title: "Portfolio", body: "Showcase finished projects with photos that do the talking." },
  { title: "Services", body: "List exactly what you offer, in plain language customers understand." },
  { title: "Reviews", body: "Link straight to your Google reviews so trust is one tap away." },
  { title: "Contact buttons", body: "Call, text, email, or visit your site — no digging for info." },
  { title: "QR code", body: "A unique code tied to your profile, ready to print or share." },
  { title: "Share link", body: "One clean URL that works everywhere — texts, email, social." },
];

export function FeatureCards() {
  return (
    <section id="features" className="border-t border-line px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow mb-3">Everything included</p>
        <h2 className="font-display max-w-xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          One profile, every detail that matters.
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 transition-transform hover:-translate-y-0.5">
              <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
