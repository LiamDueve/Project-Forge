function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function SocialLinks({
  instagram,
  facebook,
  linkedin,
  googleReviews,
}: {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  googleReviews: string | null;
}) {
  const links = [
    instagram && { label: "Instagram", href: instagram },
    facebook && { label: "Facebook", href: facebook },
    linkedin && { label: "LinkedIn", href: linkedin },
  ].filter(Boolean) as { label: string; href: string }[];

  if (links.length === 0 && !googleReviews) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={normalizeUrl(l.href)}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30"
        >
          {l.label}
        </a>
      ))}
      {googleReviews && (
        <a
          href={normalizeUrl(googleReviews)}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30"
        >
          ★ Google Reviews
        </a>
      )}
    </div>
  );
}
