export function ServicesList({ services }: { services: { id: string; name: string }[] }) {
  if (services.length === 0) return null;
  return (
    <section>
      <h2 className="eyebrow mb-3">Services</h2>
      <div className="flex flex-wrap gap-2">
        {services.map((s) => (
          <span key={s.id} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink">
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}
