import type { GoogleRating } from "@/lib/googlePlaces";

function StarRow({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div className="relative inline-flex" style={{ lineHeight: 0 }}>
      {/* Base layer: 5 gray stars, always fully visible */}
      <div className="flex items-center gap-0.5 text-line" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className="fa-solid fa-star" style={{ fontSize: "1em" }} />
        ))}
      </div>
      {/* Overlay: identical gold star row, clipped as one piece by overall
          percentage — using the same glyph as the base layer (not a
          separate outline glyph) keeps the two rows pixel-aligned, so the
          fill edge is clean instead of a jagged seam through each star. */}
      <div
        className="absolute inset-0 flex items-center gap-0.5 overflow-hidden text-amber-400"
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className="fa-solid fa-star" style={{ fontSize: "1em" }} />
        ))}
      </div>
    </div>
  );
}

export function GoogleRatingBadge({
  rating,
  fallbackHref,
}: {
  rating: GoogleRating;
  fallbackHref?: string | null;
}) {
  const href = rating.mapsUri || fallbackHref || undefined;

  const content = (
    <>
      <StarRow rating={rating.rating} />
      <span className="font-display text-sm font-bold text-ink">{rating.rating.toFixed(1)}</span>
      <span className="text-xs text-graphite">
        ({rating.reviewCount} {rating.reviewCount === 1 ? "review" : "reviews"})
      </span>
      <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-graphite">
        <i className="fa-brands fa-google" />
        Google
      </span>
    </>
  );

  const className =
    "flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 transition-colors hover:border-ink/25";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}
