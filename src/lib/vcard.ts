import type {
  ContactAddress,
  ContactCustomField,
  ContactEmail,
  ContactMessaging,
  ContactPhone,
  ContactSocial,
  ContactWebsite,
} from "./types";

// ---------------------------------------------------------------
// Smart Contact Card: vCard 3.0 generation.
//
// vCard 3.0 (rather than 4.0) is used deliberately — it has the most
// consistent parsing behavior across iOS Contacts, Android/Google
// Contacts, and Outlook. Social/messaging links use Apple's "item
// grouping" convention (itemN.URL + itemN.X-ABLabel) which iOS renders
// as nicely labeled custom fields; other clients simply show them as
// plain URL entries, which still works fine.
// ---------------------------------------------------------------

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Social",
};

const MESSAGING_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  signal: "Signal",
  discord: "Discord",
  other: "Messaging",
};

export type VCardPhoto = { data: string; mimeType: string };

export type VCardInput = {
  firstName: string;
  lastName: string;
  company?: string | null;
  jobTitle?: string | null;
  photo?: VCardPhoto | null;
  phones: Pick<ContactPhone, "label" | "number">[];
  emails: Pick<ContactEmail, "label" | "email">[];
  websites: Pick<ContactWebsite, "label" | "url">[];
  addresses: Pick<ContactAddress, "label" | "street" | "city" | "state" | "zip" | "country">[];
  socials: Pick<ContactSocial, "platform" | "value">[];
  messaging: Pick<ContactMessaging, "platform" | "value">[];
  customFields: Pick<ContactCustomField, "label" | "value">[];
  birthday?: string | null;
  notes?: string | null;
  profileUrl: string;
};

function escapeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

// Folds a line to the 75-octet limit required by RFC 6350, with
// continuation lines indented by a single space, as most parsers expect.
function foldLine(line: string): string {
  if (Buffer.byteLength(line, "utf8") <= 75) return line;
  const out: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const charBytes = Buffer.byteLength(char, "utf8");
    const limit = out.length === 0 ? 75 : 74; // continuation lines reserve 1 byte for the leading space
    if (currentBytes + charBytes > limit) {
      out.push(current);
      current = "";
      currentBytes = 0;
    }
    current += char;
    currentBytes += charBytes;
  }
  if (current) out.push(current);
  return out.join("\r\n ");
}

function phoneType(label: string): string {
  const l = (label || "").toLowerCase();
  if (l.includes("mobile") || l.includes("cell")) return "CELL";
  if (l.includes("fax")) return "FAX";
  if (l.includes("work")) return "WORK,VOICE";
  if (l.includes("home")) return "HOME,VOICE";
  return "VOICE";
}

function normalizeSocialUrl(platform: string, value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "");
  const bases: Record<string, string> = {
    linkedin: "https://linkedin.com/in/",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    twitter: "https://x.com/",
    tiktok: "https://tiktok.com/@",
    youtube: "https://youtube.com/@",
  };
  return (bases[platform] || "https://") + handle;
}

function normalizeMessagingUrl(platform: string, value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  if (platform === "whatsapp") return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
  if (platform === "telegram") return `https://t.me/${value.replace(/^@/, "")}`;
  if (platform === "signal") return `https://signal.me/#p/${value}`;
  return value;
}

export function buildVCard(input: VCardInput): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");

  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ") || "Forge Contact";
  lines.push(foldLine(`N:${escapeValue(input.lastName || "")};${escapeValue(input.firstName || "")};;;`));
  lines.push(foldLine(`FN:${escapeValue(fullName)}`));
  if (input.company) lines.push(foldLine(`ORG:${escapeValue(input.company)}`));
  if (input.jobTitle) lines.push(foldLine(`TITLE:${escapeValue(input.jobTitle)}`));

  input.phones.forEach((p) => {
    if (!p.number) return;
    lines.push(foldLine(`TEL;TYPE=${phoneType(p.label)}:${escapeValue(p.number)}`));
  });

  input.emails.forEach((e) => {
    if (!e.email) return;
    const type = (e.label || "").toLowerCase().includes("work") ? "WORK" : "HOME";
    lines.push(foldLine(`EMAIL;TYPE=INTERNET,${type}:${escapeValue(e.email)}`));
  });

  input.addresses.forEach((a) => {
    if (!a.street && !a.city) return;
    lines.push(
      foldLine(
        `ADR;TYPE=WORK:;;${escapeValue(a.street)};${escapeValue(a.city)};${escapeValue(a.state)};${escapeValue(
          a.zip
        )};${escapeValue(a.country)}`
      )
    );
  });

  input.websites.forEach((w) => {
    if (!w.url) return;
    lines.push(foldLine(`URL:${w.url}`));
  });

  let itemIndex = 1;
  input.socials.forEach((s) => {
    if (!s.value) return;
    const label = SOCIAL_LABELS[s.platform] || s.platform;
    const group = `item${itemIndex++}`;
    lines.push(foldLine(`${group}.URL:${normalizeSocialUrl(s.platform, s.value)}`));
    lines.push(foldLine(`${group}.X-ABLabel:${escapeValue(label)}`));
  });

  input.messaging.forEach((m) => {
    if (!m.value) return;
    const label = MESSAGING_LABELS[m.platform] || m.platform;
    const group = `item${itemIndex++}`;
    lines.push(foldLine(`${group}.URL:${normalizeMessagingUrl(m.platform, m.value)}`));
    lines.push(foldLine(`${group}.X-ABLabel:${escapeValue(label)}`));
  });

  // Forge profile link — always included, clearly labeled, so the visitor
  // can always tap through to the latest portfolio/services/reviews.
  {
    const group = `item${itemIndex++}`;
    lines.push(foldLine(`${group}.URL:${input.profileUrl}`));
    lines.push(foldLine(`${group}.X-ABLabel:Forge Profile`));
  }

  if (input.birthday) lines.push(foldLine(`BDAY:${input.birthday}`));

  const noteParts: string[] = [];
  if (input.notes) noteParts.push(input.notes);
  if (input.customFields.length > 0) {
    const custom = input.customFields
      .filter((c) => c.label || c.value)
      .map((c) => `${c.label}: ${c.value}`)
      .join(" | ");
    if (custom) noteParts.push(custom);
  }
  if (noteParts.length > 0) lines.push(foldLine(`NOTE:${escapeValue(noteParts.join(" — "))}`));

  if (input.photo) {
    const type = input.photo.mimeType.split("/")[1]?.toUpperCase() || "JPEG";
    lines.push(foldLine(`PHOTO;ENCODING=b;TYPE=${type}:${input.photo.data}`));
  }

  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
