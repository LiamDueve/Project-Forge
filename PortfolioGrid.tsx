import { BeforeAfterSlider } from "@/components/profile/BeforeAfterSlider";

type Item = {
  id: string;
  kind: "single" | "compare";
  image_url: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  caption: string | null;
};

export function PortfolioGrid({ items }: { items: Item[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="eyebrow mb-3">Portfolio</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) =>
          item.kind === "compare" && item.before_image_url && item.after_image_url ? (
            <div key={item.id} className="col-span-2">
              <BeforeAfterSlider before={item.before_image_url} after={item.after_image_url} caption={item.caption} />
            </div>
          ) : item.image_url ? (
            <figure key={item.id} className="m-0 overflow-hidden rounded-2xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.caption || ""} className="aspect-square w-full object-cover" />
              {item.caption && <figcaption className="px-3 py-2 text-xs text-graphite">{item.caption}</figcaption>}
            </figure>
          ) : null
        )}
      </div>
    </section>
  );
}
