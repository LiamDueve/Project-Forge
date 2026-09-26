"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { RepeatableRows, newId } from "@/components/dashboard/RepeatableRows";
import { ContactCardPreview } from "@/components/dashboard/ContactCardPreview";
import { getSiteUrl } from "@/lib/utils";
import type {
  ContactAddress,
  ContactCard,
  ContactCustomField,
  ContactEmail,
  ContactMessaging,
  ContactPhone,
  ContactSocial,
  MessagingPlatform,
  Profile,
  SocialPlatform,
  ContactWebsite,
} from "@/lib/types";

const SOCIAL_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

const MESSAGING_OPTIONS: { value: MessagingPlatform; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "signal", label: "Signal" },
  { value: "discord", label: "Discord" },
  { value: "other", label: "Other" },
];

export default function ContactCardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [cardId, setCardId] = useState<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [birthday, setBirthday] = useState("");
  const [notes, setNotes] = useState("");

  const [phones, setPhones] = useState<ContactPhone[]>([]);
  const [emails, setEmails] = useState<ContactEmail[]>([]);
  const [websites, setWebsites] = useState<ContactWebsite[]>([]);
  const [addresses, setAddresses] = useState<ContactAddress[]>([]);
  const [socials, setSocials] = useState<ContactSocial[]>([]);
  const [messaging, setMessaging] = useState<ContactMessaging[]>([]);
  const [customFields, setCustomFields] = useState<ContactCustomField[]>([]);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle<Profile>();

      if (!profile) {
        setLoading(false);
        return;
      }
      setProfileId(profile.id);
      setUsername(profile.username);

      const { data: card } = await supabase
        .from("contact_cards")
        .select("*")
        .eq("profile_id", profile.id)
        .maybeSingle<ContactCard>();

      if (card) {
        setCardId(card.id);
        setPhotoUrl(card.photo_url);
        setFirstName(card.first_name || "");
        setLastName(card.last_name || "");
        setCompany(card.company || "");
        setJobTitle(card.job_title || "");
        setBirthday(card.birthday || "");
        setNotes(card.notes || "");
        setPhones(card.phones?.length ? card.phones : []);
        setEmails(card.emails?.length ? card.emails : []);
        setWebsites(card.websites?.length ? card.websites : []);
        setAddresses(card.addresses?.length ? card.addresses : []);
        setSocials(card.socials?.length ? card.socials : []);
        setMessaging(card.messaging?.length ? card.messaging : []);
        setCustomFields(card.custom_fields?.length ? card.custom_fields : []);
      } else {
        // Pre-fill from the public profile so this doesn't start empty.
        const [fFirst, ...fRest] = (profile.full_name || "").trim().split(" ");
        setPhotoUrl(profile.profile_photo_url);
        setFirstName(fFirst || "");
        setLastName(fRest.join(" "));
        setCompany(profile.company_name || "");
        setJobTitle(profile.profession || "");
        if (profile.phone) setPhones([{ id: newId(), label: "Mobile", number: profile.phone }]);
        if (profile.email) setEmails([{ id: newId(), label: "Work", email: profile.email }]);
        if (profile.website) setWebsites([{ id: newId(), label: "Website", url: profile.website }]);
        const prefilledSocials: ContactSocial[] = [];
        if (profile.instagram) prefilledSocials.push({ id: newId(), platform: "instagram", value: profile.instagram });
        if (profile.facebook) prefilledSocials.push({ id: newId(), platform: "facebook", value: profile.facebook });
        if (profile.linkedin) prefilledSocials.push({ id: newId(), platform: "linkedin", value: profile.linkedin });
        setSocials(prefilledSocials);
      }

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!userId || !profileId) return;
    setSaving(true);
    setError(null);
    try {
      let finalPhotoUrl = photoUrl;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${userId}/contact-card-${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("profile-photos").upload(path, photoFile, {
          upsert: true,
        });
        if (uploadError) throw uploadError;
        finalPhotoUrl = supabase.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        profile_id: profileId,
        photo_url: finalPhotoUrl,
        first_name: firstName || null,
        last_name: lastName || null,
        company: company || null,
        job_title: jobTitle || null,
        birthday: birthday || null,
        notes: notes || null,
        phones,
        emails,
        websites,
        addresses,
        socials,
        messaging,
        custom_fields: customFields,
        updated_at: new Date().toISOString(),
      };

      const upsertPayload = cardId ? { id: cardId, ...payload } : payload;

      const { data: result, error: saveError } = await supabase
        .from("contact_cards")
        .upsert(upsertPayload, { onConflict: "profile_id" })
        .select("*")
        .single();

      if (saveError) throw saveError;
      setCardId(result.id);
      setPhotoUrl(finalPhotoUrl);
      setPhotoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong saving your contact card.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-graphite">Loading your contact card…</p>;
  }

  const profileUrl = username ? `${getSiteUrl()}/p/${username}` : getSiteUrl();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Contact Card</h1>
          <p className="mt-1 max-w-lg text-sm text-graphite">
            This is exactly what gets saved to someone&apos;s phone when they tap{" "}
            <span className="font-medium text-ink">Save Contact</span> on your public profile. It can be different
            from what&apos;s shown publicly.
          </p>
        </div>
        {username && (
          <a
            href={`/api/vcard/${username}`}
            className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30"
          >
            Download test .vcf
          </a>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <CollapsibleSection title="General" description="Name, company, and photo" defaultOpen>
            <div className="flex flex-wrap gap-6">
              <ImageUpload
                label="Contact photo"
                shape="circle"
                previewUrl={photoUrl}
                onFileSelected={(file) => {
                  setPhotoFile(file);
                  setPhotoUrl(URL.createObjectURL(file));
                }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Field>
              <Field label="Last name">
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Field>
              <Field label="Company">
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
              </Field>
              <Field label="Job title">
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </Field>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Phone Numbers" description="Add as many as you need">
            <RepeatableRows
              items={phones}
              onChange={setPhones}
              addLabel="Add phone number"
              emptyHint="No phone numbers yet."
              newItem={() => ({ id: newId(), label: "Mobile", number: "" })}
              renderRow={(item, update, remove) => (
                <div className="grid grid-cols-[76px_1fr_auto] items-center gap-2 sm:grid-cols-[100px_1fr_auto]">
                  <Input
                    value={item.label}
                    placeholder="Label"
                    onChange={(e) => update({ label: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <Input
                    value={item.number}
                    placeholder="(555) 123-4567"
                    onChange={(e) => update({ number: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <RemoveButton onClick={remove} />
                </div>
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Emails" description="Add as many as you need">
            <RepeatableRows
              items={emails}
              onChange={setEmails}
              addLabel="Add email"
              emptyHint="No emails yet."
              newItem={() => ({ id: newId(), label: "Work", email: "" })}
              renderRow={(item, update, remove) => (
                <div className="grid grid-cols-[76px_1fr_auto] items-center gap-2 sm:grid-cols-[100px_1fr_auto]">
                  <Input
                    value={item.label}
                    placeholder="Label"
                    onChange={(e) => update({ label: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <Input
                    type="email"
                    value={item.email}
                    placeholder="name@company.com"
                    onChange={(e) => update({ email: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <RemoveButton onClick={remove} />
                </div>
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Websites" description="Add as many as you need">
            <RepeatableRows
              items={websites}
              onChange={setWebsites}
              addLabel="Add website"
              emptyHint="No websites yet."
              newItem={() => ({ id: newId(), label: "Website", url: "" })}
              renderRow={(item, update, remove) => (
                <div className="grid grid-cols-[76px_1fr_auto] items-center gap-2 sm:grid-cols-[100px_1fr_auto]">
                  <Input
                    value={item.label}
                    placeholder="Label"
                    onChange={(e) => update({ label: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <Input
                    value={item.url}
                    placeholder="yourcompany.com"
                    onChange={(e) => update({ url: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <RemoveButton onClick={remove} />
                </div>
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Addresses" description="Business or job-site addresses">
            <RepeatableRows
              items={addresses}
              onChange={setAddresses}
              addLabel="Add address"
              emptyHint="No addresses yet."
              newItem={() => ({
                id: newId(),
                label: "Office",
                street: "",
                city: "",
                state: "",
                zip: "",
                country: "",
              })}
              renderRow={(item, update, remove) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.label}
                      placeholder="Label"
                      onChange={(e) => update({ label: e.target.value })}
                      className="!py-1.5 text-xs"
                    />
                    <RemoveButton onClick={remove} />
                  </div>
                  <Input
                    value={item.street}
                    placeholder="Street address"
                    onChange={(e) => update({ street: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={item.city}
                      placeholder="City"
                      onChange={(e) => update({ city: e.target.value })}
                      className="!py-1.5 text-xs"
                    />
                    <Input
                      value={item.state}
                      placeholder="State"
                      onChange={(e) => update({ state: e.target.value })}
                      className="!py-1.5 text-xs"
                    />
                    <Input
                      value={item.zip}
                      placeholder="ZIP code"
                      onChange={(e) => update({ zip: e.target.value })}
                      className="!py-1.5 text-xs"
                    />
                    <Input
                      value={item.country}
                      placeholder="Country"
                      onChange={(e) => update({ country: e.target.value })}
                      className="!py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Social Profiles" description="LinkedIn, Instagram, Facebook, X, TikTok, YouTube">
            <RepeatableRows
              items={socials}
              onChange={setSocials}
              addLabel="Add social profile"
              emptyHint="No social profiles yet."
              newItem={() => ({ id: newId(), platform: "instagram" as SocialPlatform, value: "" })}
              renderRow={(item, update, remove) => (
                <div className="grid grid-cols-[96px_1fr_auto] items-center gap-2 sm:grid-cols-[120px_1fr_auto]">
                  <select
                    value={item.platform}
                    onChange={(e) => update({ platform: e.target.value as SocialPlatform })}
                    className="rounded-xl border border-line bg-white px-2 py-1.5 text-xs text-ink focus-ring"
                  >
                    {SOCIAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={item.value}
                    placeholder="Username or URL"
                    onChange={(e) => update({ value: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <RemoveButton onClick={remove} />
                </div>
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Messaging Apps" description="WhatsApp, Telegram, Signal, Discord">
            <RepeatableRows
              items={messaging}
              onChange={setMessaging}
              addLabel="Add messaging app"
              emptyHint="No messaging apps yet."
              newItem={() => ({ id: newId(), platform: "whatsapp" as MessagingPlatform, value: "" })}
              renderRow={(item, update, remove) => (
                <div className="grid grid-cols-[96px_1fr_auto] items-center gap-2 sm:grid-cols-[120px_1fr_auto]">
                  <select
                    value={item.platform}
                    onChange={(e) => update({ platform: e.target.value as MessagingPlatform })}
                    className="rounded-xl border border-line bg-white px-2 py-1.5 text-xs text-ink focus-ring"
                  >
                    {MESSAGING_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={item.value}
                    placeholder="Username, number, or link"
                    onChange={(e) => update({ value: e.target.value })}
                    className="!py-1.5 text-xs"
                  />
                  <RemoveButton onClick={remove} />
                </div>
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Advanced" description="Birthday, notes, and custom fields">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Birthday" hint="Optional">
                <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Custom fields</span>
              <RepeatableRows
                items={customFields}
                onChange={setCustomFields}
                addLabel="Add custom field"
                emptyHint="No custom fields yet."
                newItem={() => ({ id: newId(), label: "", value: "" })}
                renderRow={(item, update, remove) => (
                  <div className="grid grid-cols-[96px_1fr_auto] items-center gap-2 sm:grid-cols-[120px_1fr_auto]">
                    <Input
                      value={item.label}
                      placeholder="Field name"
                      onChange={(e) => update({ label: e.target.value })}
                      className="!py-1.5 text-xs"
                    />
                    <Input
                      value={item.value}
                      placeholder="Value"
                      onChange={(e) => update({ value: e.target.value })}
                      className="!py-1.5 text-xs"
                    />
                    <RemoveButton onClick={remove} />
                  </div>
                )}
              />
            </div>
          </CollapsibleSection>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-4 pb-10">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {saved && <span className="text-sm text-graphite">Saved.</span>}
          </div>
        </div>

        <div className="hidden lg:block">
          <ContactCardPreview
            photoUrl={photoUrl}
            firstName={firstName}
            lastName={lastName}
            company={company}
            jobTitle={jobTitle}
            phones={phones}
            emails={emails}
            websites={websites}
            addresses={addresses}
            socials={socials}
            messaging={messaging}
            customFields={customFields}
            notes={notes}
            profileUrl={profileUrl}
          />
        </div>
      </div>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-graphite hover:bg-ink/5 hover:text-ink"
    >
      ×
    </button>
  );
}
