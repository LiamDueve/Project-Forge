import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ContactRows } from "@/components/profile/ContactRows";
import { ServicesList } from "@/components/profile/ServicesList";
import { PortfolioGrid } from "@/components/profile/PortfolioGrid";
import { ProjectsGrid } from "@/components/profile/ProjectsGrid";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";
import { GoogleRatingBadge } from "@/components/profile/GoogleRatingBadge";
import { InAppBrowserBanner } from "@/components/profile/InAppBrowserBanner";
import { getGoogleRating, type GoogleRating } from "@/lib/googlePlaces";
import { detectInAppBrowser } from "@/lib/inAppBrowser";

async function getProfile(username: string) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return null;

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at");

  const { data: portfolio_items } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_public", true)
    .order("sort_order");

  return {
    ...profile,
    services: services || [],
    portfolio_items: portfolio_items || [],
    projects: projects || [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const profile = await getProfile(params.username);
  if (!profile) return { title: "Profile not found — Forge" };
  const name = profile.full_name || profile.company_name || profile.username;
  return {
    title: `${name} — Forge`,
    description: profile.bio || `${name}'s business profile on Forge.`,
  };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const displayName = profile.full_name || profile.username;
  const metaLine = [profile.profession, profile.company_name].filter(Boolean).join(" · ");

  let googleRating: GoogleRating | null = null;
  if (profile.show_google_rating) {
    if (profile.google_rating != null) {
      // Manually entered by the profile owner — no API, no cost.
      googleRating = { rating: profile.google_rating, reviewCount: profile.google_rating_count || 0, mapsUri: null };
    } else if (profile.google_place_id) {
      // Advanced option — live lookup, only runs if a Place ID was set.
      googleRating = await getGoogleRating(profile.google_place_id);
    }
  }

  const userAgent = headers().get("user-agent");
  const { isInApp, appName } = detectInAppBrowser(userAgent);

  return (
    <main className="min-h-screen bg-paper pb-16">
      <div className="mx-auto max-w-lg px-4 pt-5 sm:px-6">
        {isInApp && appName && <InAppBrowserBanner appName={appName} />}

        {/* Banner */}
        <div
          className="prism-ring relative h-[168px] overflow-hidden rounded-3xl"
          style={{ background: profile.logo_url ? "#0A0A0A" : "linear-gradient(135deg, #161616 0%, #000 100%)" }}
        >
          {profile.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center px-7">
              <span className="prism-text font-display text-2xl leading-tight">
                {profile.company_name || profile.full_name || "Your Company"}
              </span>
            </div>
          )}
        </div>

        {/* Avatar overlapping the banner */}
        <div className="relative z-[2] -mt-5 ml-5">
          <ProfilePhoto photoUrl={profile.profile_photo_url} name={displayName} />
        </div>

        <div className="mt-3.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{displayName}</h1>
          {metaLine && <p className="mt-1 text-sm text-graphite">{metaLine}</p>}
          {profile.service_area && <p className="mt-0.5 text-xs text-graphite">{profile.service_area}</p>}
          {profile.bio && <p className="mt-3 text-sm leading-relaxed text-ink">{profile.bio}</p>}
        </div>

        {googleRating && (
          <div className="mt-4">
            <GoogleRatingBadge rating={googleRating} fallbackHref={profile.google_reviews} />
          </div>
        )}

        {profile.services.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.services.map((s: { id: string; name: string }) => (
              <span key={s.id} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink">
                {s.name}
              </span>
            ))}
          </div>
        )}

        <a
          href={`/api/vcard/${profile.username}`}
          className="prism-glow mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base font-semibold text-paper shadow-card transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <i className="fa-solid fa-address-card" />
          Save Contact
        </a>

        <div className="mt-6">
          <ContactRows
            profile={{
              phone: profile.phone,
              email: profile.email,
              website: profile.website,
              whatsapp: profile.whatsapp,
              instagram: profile.instagram,
              tiktok: profile.tiktok,
              facebook: profile.facebook,
              twitter: profile.twitter,
              youtube: profile.youtube,
              pinterest: profile.pinterest,
              linkedin: profile.linkedin,
              yelp: profile.yelp,
              google_reviews: profile.google_reviews,
            }}
          />
        </div>

        {profile.projects_section_enabled && profile.projects.length > 0 && (
          <div className="mt-10">
            <ProjectsGrid
              sectionName={profile.projects_section_name || "Projects"}
              projects={profile.projects}
              username={profile.username}
            />
          </div>
        )}

        <div className="mt-10">
          <PortfolioGrid items={profile.portfolio_items} />
        </div>

        <footer className="mt-14 border-t border-line pt-6 text-center">
          <p className="text-xs text-graphite">
            Powered by <span className="prism-text font-bold">Forge</span>
          </p>
        </footer>
      </div>
    </main>
  );
}

