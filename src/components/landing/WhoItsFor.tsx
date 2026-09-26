const audiences = ["Contractors", "Realtors", "Builders", "Property Managers", "Developers"];

export function WhoItsFor() {
  return (
    <section id="who-its-for" className="border-t border-line px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow mb-3">Who it&apos;s for</p>
        <h2 className="font-display max-w-xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Built for people whose work is their reputation.
        </h2>
        <div className="mt-10 flex flex-wrap gap-3">
          {audiences.map((a) => (
            <span
              key={a}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
