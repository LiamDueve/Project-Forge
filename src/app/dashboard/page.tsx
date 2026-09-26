import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";
import { QRCodeCard } from "@/components/dashboard/QRCodeCard";
import { profileCompletion, getSiteUrl } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const fallbackUsername = `user-${user.id.slice(0, 8)}`;
    const { data: created } = await supabase
      .from("profiles")
      .insert({ user_id: user.id, username: fallbackUsername, email: user.email })
      .select("*")
      .single();
    profile = created;
  }

  const completion = profile ? profileCompletion(profile) : 0;
  const profileUrl = `${getSiteUrl()}/p/${profile?.username}`;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-1 text-sm text-graphite">Here&apos;s the state of your Forge profile.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="card p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Profile completion</h3>
            <span className="text-sm font-semibold text-graphite">{completion}%</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ink transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-graphite">
            {completion < 100
              ? "Finish filling out your profile so customers see your full identity."
              : "Your profile is complete and looking sharp."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/dashboard/profile">Edit profile</LinkButton>
            <LinkButton href={`/p/${profile?.username}`} variant="secondary">
              View public profile
            </LinkButton>
          </div>
        </div>

        <QRCodeCard profileUrl={profileUrl} />

        <div className="card p-6 md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">Contact Card</h3>
              <p className="mt-1 text-sm text-graphite">
                Customize exactly what gets saved to someone&apos;s phone when they tap{" "}
                <span className="font-medium text-ink">Save Contact</span> on your profile.
              </p>
            </div>
            <LinkButton href="/dashboard/contact-card" variant="secondary">
              Edit Contact Card
            </LinkButton>
          </div>
        </div>

        <div className="card p-6 md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">Projects</h3>
              <p className="mt-1 text-sm text-graphite">
                Show what you actually do — listings, developments, case studies, or anything else worth
                showing off, with its own detail page.
              </p>
            </div>
            <LinkButton href="/dashboard/projects" variant="secondary">
              Edit Projects
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
