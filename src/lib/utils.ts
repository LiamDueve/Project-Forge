export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export function profileCompletion(profile: {
  full_name?: string | null;
  company_name?: string | null;
  profession?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  profile_photo_url?: string | null;
  service_area?: string | null;
}): number {
  const fields = [
    profile.full_name,
    profile.company_name,
    profile.profession,
    profile.bio,
    profile.phone,
    profile.email,
    profile.profile_photo_url,
    profile.service_area,
  ];
  const filled = fields.filter((f) => f && f.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function formatPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatSmsHref(phone: string): string {
  return `sms:${phone.replace(/[^\d+]/g, "")}`;
}

export function normalizeUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function whatsappHref(value: string): string {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
}

// Formats a phone number for display. US/Canada 10-digit numbers become
// "+1 (555) 123-4567"; anything else falls back to what was typed, since we
// can't confidently reformat international numbers without knowing the
// country.
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  let d = digits;
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  if (d.length === 10) {
    return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return phone;
}

// Turns whatever someone typed into a social field — a bare handle, an
// "@handle", or a full profile URL — into a clean "@handle" for display.
// The stored value (and the link it points to) is untouched; this only
// affects what text shows on the row.
export function extractSocialHandle(platform: string, value: string): string {
  let v = value.trim();
  const urlMatch = v.match(/^https?:\/\/(?:www\.)?[^/]+\/?(.*)$/i);
  if (urlMatch) v = urlMatch[1];
  v = v.replace(/^@/, "");
  if (platform === "linkedin") v = v.replace(/^(company|in)\//i, "");
  v = v.split("?")[0].replace(/\/+$/, "");
  return v ? `@${v}` : value;
}

// Strips the protocol/www/trailing slash from a website URL for a cleaner
// display string, e.g. "https://www.example.com/" -> "example.com".
export function cleanWebsiteDisplay(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

// One entry per contact/social type shown as an icon-row on the public
// profile — real brand icon (Font Awesome) + real brand color.
export const CONTACT_ICONS: Record<string, { cls: string; bg: string }> = {
  call: { cls: "fa-solid fa-phone", bg: "#22C55E" },
  text: { cls: "fa-solid fa-comment-dots", bg: "#0EA5E9" },
  whatsapp: { cls: "fa-brands fa-whatsapp", bg: "#25D366" },
  email: { cls: "fa-solid fa-envelope", bg: "#3B82F6" },
  website: { cls: "fa-solid fa-globe", bg: "#3B82F6" },
  instagram: { cls: "fa-brands fa-instagram", bg: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF,#515BD4)" },
  facebook: { cls: "fa-brands fa-facebook-f", bg: "#1877F2" },
  tiktok: { cls: "fa-brands fa-tiktok", bg: "#000000" },
  twitter: { cls: "fa-brands fa-x-twitter", bg: "#000000" },
  youtube: { cls: "fa-brands fa-youtube", bg: "#FF0000" },
  pinterest: { cls: "fa-brands fa-pinterest-p", bg: "#E60023" },
  linkedin: { cls: "fa-brands fa-linkedin-in", bg: "#0A66C2" },
  yelp: { cls: "fa-brands fa-yelp", bg: "#D32323" },
  reviews: { cls: "fa-brands fa-google", bg: "#4285F4" },
};
