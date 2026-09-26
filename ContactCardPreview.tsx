import type {
  ContactAddress,
  ContactCustomField,
  ContactEmail,
  ContactMessaging,
  ContactPhone,
  ContactSocial,
  ContactWebsite,
} from "@/lib/types";

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

export function ContactCardPreview({
  photoUrl,
  firstName,
  lastName,
  company,
  jobTitle,
  phones,
  emails,
  websites,
  addresses,
  socials,
  messaging,
  customFields,
  notes,
  profileUrl,
}: {
  photoUrl: string | null;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  phones: ContactPhone[];
  emails: ContactEmail[];
  websites: ContactWebsite[];
  addresses: ContactAddress[];
  socials: ContactSocial[];
  messaging: ContactMessaging[];
  customFields: ContactCustomField[];
  notes: string;
  profileUrl: string;
}) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Your Name";

  return (
    <div className="sticky top-24 overflow-hidden rounded-[32px] border border-line bg-white shadow-card">
      <div className="border-b border-line bg-paper px-5 py-3 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-graphite">
          What their phone will receive
        </span>
      </div>
      <div className="max-h-[560px] overflow-y-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink font-display text-xl font-bold text-paper">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className="font-display mt-3 text-lg font-bold text-ink">{fullName}</h3>
          {(jobTitle || company) && (
            <p className="text-sm text-graphite">{[jobTitle, company].filter(Boolean).join(" · ")}</p>
          )}
        </div>

        <div className="mt-6 space-y-5">
          {phones.filter((p) => p.number).length > 0 && (
            <PreviewGroup label="Phone">
              {phones
                .filter((p) => p.number)
                .map((p) => (
                  <PreviewRow key={p.id} label={p.label || "Phone"} value={p.number} />
                ))}
            </PreviewGroup>
          )}
          {emails.filter((e) => e.email).length > 0 && (
            <PreviewGroup label="Email">
              {emails
                .filter((e) => e.email)
                .map((e) => (
                  <PreviewRow key={e.id} label={e.label || "Email"} value={e.email} />
                ))}
            </PreviewGroup>
          )}
          {websites.filter((w) => w.url).length > 0 && (
            <PreviewGroup label="Website">
              {websites
                .filter((w) => w.url)
                .map((w) => (
                  <PreviewRow key={w.id} label={w.label || "Website"} value={w.url} />
                ))}
            </PreviewGroup>
          )}
          {addresses.filter((a) => a.street || a.city).length > 0 && (
            <PreviewGroup label="Address">
              {addresses
                .filter((a) => a.street || a.city)
                .map((a) => (
                  <PreviewRow
                    key={a.id}
                    label={a.label || "Address"}
                    value={[a.street, a.city, [a.state, a.zip].filter(Boolean).join(" "), a.country]
                      .filter(Boolean)
                      .join(", ")}
                  />
                ))}
            </PreviewGroup>
          )}
          {socials.filter((s) => s.value).length > 0 && (
            <PreviewGroup label="Social profiles">
              {socials
                .filter((s) => s.value)
                .map((s) => (
                  <PreviewRow key={s.id} label={SOCIAL_LABELS[s.platform] || s.platform} value={s.value} />
                ))}
            </PreviewGroup>
          )}
          {messaging.filter((m) => m.value).length > 0 && (
            <PreviewGroup label="Messaging">
              {messaging
                .filter((m) => m.value)
                .map((m) => (
                  <PreviewRow key={m.id} label={MESSAGING_LABELS[m.platform] || m.platform} value={m.value} />
                ))}
            </PreviewGroup>
          )}
          {customFields.filter((c) => c.label || c.value).length > 0 && (
            <PreviewGroup label="Other">
              {customFields
                .filter((c) => c.label || c.value)
                .map((c) => (
                  <PreviewRow key={c.id} label={c.label || "Field"} value={c.value} />
                ))}
            </PreviewGroup>
          )}

          <PreviewGroup label="Linked">
            <PreviewRow label="Forge Profile" value={profileUrl} />
          </PreviewGroup>

          {notes && (
            <PreviewGroup label="Notes">
              <p className="text-sm text-ink">{notes}</p>
            </PreviewGroup>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2 text-sm last:border-0 last:pb-0">
      <span className="text-graphite">{label}</span>
      <span className="truncate text-right text-ink">{value}</span>
    </div>
  );
}
