import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildVCard, type VCardPhoto } from "@/lib/vcard";
import { getSiteUrl } from "@/lib/utils";
import type { ContactCard } from "@/lib/types";

export async function GET(_request: NextRequest, { params }: { params: { username: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: card } = await supabase
    .from("contact_cards")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle<ContactCard>();

  // Fall back to public profile fields for anything the user hasn't
  // customized in their Contact Card editor, so "Save Contact" always
  // works even before they've set one up.
  const [fallbackFirst, ...fallbackRest] = (profile.full_name || "").trim().split(" ");
  const firstName = card?.first_name || fallbackFirst || "";
  const lastName = card?.last_name || fallbackRest.join(" ") || "";

  const phones =
    card?.phones && card.phones.length > 0
      ? card.phones
      : profile.phone
      ? [{ label: "Mobile", number: profile.phone }]
      : [];

  const emails =
    card?.emails && card.emails.length > 0
      ? card.emails
      : profile.email
      ? [{ label: "Work", email: profile.email }]
      : [];

  const websites =
    card?.websites && card.websites.length > 0
      ? card.websites
      : profile.website
      ? [{ label: "Website", url: profile.website }]
      : [];

  const addresses = card?.addresses && card.addresses.length > 0 ? card.addresses : [];

  const socials =
    card?.socials && card.socials.length > 0
      ? card.socials
      : ([
          profile.instagram ? { platform: "instagram" as const, value: profile.instagram } : null,
          profile.facebook ? { platform: "facebook" as const, value: profile.facebook } : null,
          profile.linkedin ? { platform: "linkedin" as const, value: profile.linkedin } : null,
        ].filter(Boolean) as { platform: "instagram" | "facebook" | "linkedin"; value: string }[]);

  const photoUrl = card?.photo_url || profile.profile_photo_url;
  let photo: VCardPhoto | null = null;
  if (photoUrl) {
    try {
      const res = await fetch(photoUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const mimeType = res.headers.get("content-type") || "image/jpeg";
        photo = { data: buf.toString("base64"), mimeType };
      }
    } catch {
      // Photo embedding is best-effort — the vCard still works without it.
    }
  }

  const vcard = buildVCard({
    firstName,
    lastName,
    company: card?.company || profile.company_name,
    jobTitle: card?.job_title || profile.profession,
    photo,
    phones,
    emails,
    websites,
    addresses,
    socials,
    messaging: card?.messaging || [],
    customFields: card?.custom_fields || [],
    birthday: card?.birthday || null,
    notes: card?.notes || null,
    profileUrl: `${getSiteUrl()}/p/${profile.username}`,
  });

  const filenameBase = [firstName, lastName].filter(Boolean).join("-") || profile.username;
  const filename = `${filenameBase.replace(/[^a-zA-Z0-9-]+/g, "-")}.vcf`;

  return new NextResponse(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
