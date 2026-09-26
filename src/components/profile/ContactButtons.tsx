import { formatPhoneHref, formatSmsHref } from "@/lib/utils";

function normalizeUrl(url: string) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function ContactButtons({
  phone,
  email,
  website,
}: {
  phone: string | null;
  email: string | null;
  website: string | null;
}) {
  const buttons = [
    phone && { label: "Call", href: formatPhoneHref(phone) },
    phone && { label: "Text", href: formatSmsHref(phone) },
    email && { label: "Email", href: `mailto:${email}` },
    website && { label: "Website", href: normalizeUrl(website) },
  ].filter(Boolean) as { label: string; href: string }[];

  if (buttons.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target={b.label === "Website" ? "_blank" : undefined}
          rel={b.label === "Website" ? "noopener noreferrer" : undefined}
          className="focus-ring rounded-xl bg-ink px-4 py-3 text-center text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
        >
          {b.label}
        </a>
      ))}
    </div>
  );
}
