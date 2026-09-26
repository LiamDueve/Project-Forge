import {
  CONTACT_ICONS,
  cleanWebsiteDisplay,
  extractSocialHandle,
  formatPhoneDisplay,
  formatPhoneHref,
  formatSmsHref,
  normalizeUrl,
  whatsappHref,
} from "@/lib/utils";

type Row = { type: string; label: string; value: string; href: string; external?: boolean };

export function ContactRows({
  profile,
}: {
  profile: {
    phone: string | null;
    email: string | null;
    website: string | null;
    whatsapp: string | null;
    instagram: string | null;
    tiktok: string | null;
    facebook: string | null;
    twitter: string | null;
    youtube: string | null;
    pinterest: string | null;
    linkedin: string | null;
    yelp: string | null;
    google_reviews: string | null;
  };
}) {
  const phoneDisplay = profile.phone ? formatPhoneDisplay(profile.phone) : "";

  const rows = [
    profile.phone && { type: "call", label: "Call me", value: phoneDisplay, href: formatPhoneHref(profile.phone) },
    profile.phone && { type: "text", label: "Text me", value: phoneDisplay, href: formatSmsHref(profile.phone) },
    profile.whatsapp && {
      type: "whatsapp",
      label: "WhatsApp",
      value: formatPhoneDisplay(profile.whatsapp),
      href: whatsappHref(profile.whatsapp),
      external: true,
    },
    profile.instagram && {
      type: "instagram",
      label: "Instagram",
      value: extractSocialHandle("instagram", profile.instagram),
      href: normalizeUrl(profile.instagram),
      external: true,
    },
    profile.tiktok && {
      type: "tiktok",
      label: "TikTok",
      value: extractSocialHandle("tiktok", profile.tiktok),
      href: normalizeUrl(profile.tiktok),
      external: true,
    },
    profile.facebook && {
      type: "facebook",
      label: "Facebook",
      value: extractSocialHandle("facebook", profile.facebook),
      href: normalizeUrl(profile.facebook),
      external: true,
    },
    profile.twitter && {
      type: "twitter",
      label: "X (Twitter)",
      value: extractSocialHandle("twitter", profile.twitter),
      href: normalizeUrl(profile.twitter),
      external: true,
    },
    profile.youtube && {
      type: "youtube",
      label: "YouTube",
      value: extractSocialHandle("youtube", profile.youtube),
      href: normalizeUrl(profile.youtube),
      external: true,
    },
    profile.pinterest && {
      type: "pinterest",
      label: "Pinterest",
      value: extractSocialHandle("pinterest", profile.pinterest),
      href: normalizeUrl(profile.pinterest),
      external: true,
    },
    profile.linkedin && {
      type: "linkedin",
      label: "LinkedIn",
      value: extractSocialHandle("linkedin", profile.linkedin),
      href: normalizeUrl(profile.linkedin),
      external: true,
    },
    profile.email && { type: "email", label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    profile.website && {
      type: "website",
      label: "Website",
      value: cleanWebsiteDisplay(profile.website),
      href: normalizeUrl(profile.website),
      external: true,
    },
    profile.yelp && {
      type: "yelp",
      label: "Yelp",
      value: "Read reviews",
      href: normalizeUrl(profile.yelp),
      external: true,
    },
    profile.google_reviews && {
      type: "reviews",
      label: "Google Reviews",
      value: "See what customers say",
      href: normalizeUrl(profile.google_reviews),
      external: true,
    },
  ].filter(Boolean) as Row[];

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const icon = CONTACT_ICONS[r.type];
        return (
          <a
            key={r.type}
            href={r.href}
            target={r.external ? "_blank" : undefined}
            rel={r.external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white px-4 py-3.5 transition-colors hover:border-ink/25"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: icon.bg }}
            >
              <i className={icon.cls} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{r.label}</span>
              <span className="block truncate text-xs text-graphite">{r.value}</span>
            </span>
            <span className="text-graphite">&rsaquo;</span>
          </a>
        );
      })}
    </div>
  );
}
