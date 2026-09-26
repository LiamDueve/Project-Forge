import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

async function getProjectWithProfile(username: string, projectId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (!profile) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!project) return null;
  return { profile, project };
}

export async function generateMetadata({
  params,
}: {
  params: { username: string; id: string };
}): Promise<Metadata> {
  const data = await getProjectWithProfile(params.username, params.id);
  if (!data) return { title: "Project not found — Forge" };
  return {
    title: `${data.project.title} — ${data.profile.full_name || data.profile.username}`,
    description: data.project.short_description || data.project.full_description || undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { username: string; id: string };
}) {
  const data = await getProjectWithProfile(params.username, params.id);
  if (!data) notFound();
  const { profile, project } = data;

  const displayName = profile.full_name || profile.username;
  const customFields = (project.custom_fields || []) as { id: string; label: string; value: string }[];
  const gallery = (project.gallery_images || []) as string[];

  return (
    <main className="min-h-screen bg-paper pb-16">
      <div className="mx-auto max-w-lg px-4 pt-5 sm:px-6">
        {/* Identity header — links back to the main profile */}
        <Link href={`/p/${profile.username}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 transition-colors hover:border-ink/25">
          {profile.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.profile_photo_url} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="font-display flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
              {(displayName || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink">{displayName}</span>
            <span className="block truncate text-xs text-graphite">View full profile</span>
          </span>
          <i className="fa-solid fa-chevron-right text-xs text-graphite" />
        </Link>

        {/* Cover image */}
        {project.cover_image_url && (
          <div className="prism-ring mt-4 overflow-hidden rounded-3xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover_image_url} alt={project.title} className="aspect-[3/2] w-full object-cover" />
          </div>
        )}

        <div className="mt-4">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{project.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite">
            {project.status && (
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-medium text-ink">
                {project.status}
              </span>
            )}
            {project.location && <span>{project.location}</span>}
            {project.project_date && <span>{project.project_date}</span>}
          </p>
          {project.short_description && (
            <p className="mt-2 text-sm font-medium text-ink">{project.short_description}</p>
          )}
        </div>

        {customFields.filter((f) => f.label || f.value).length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {customFields
              .filter((f) => f.label || f.value)
              .map((f) => (
                <div key={f.id} className="rounded-xl border border-line bg-white px-3 py-2.5">
                  <p className="eyebrow">{f.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">{f.value}</p>
                </div>
              ))}
          </div>
        )}

        {project.full_description && (
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink">{project.full_description}</p>
        )}

        {gallery.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {gallery.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                className="aspect-square w-full rounded-2xl border border-line object-cover"
              />
            ))}
          </div>
        )}

        {project.external_link_url && (
          <a
            href={/^https?:\/\//i.test(project.external_link_url) ? project.external_link_url : `https://${project.external_link_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="prism-glow mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base font-semibold text-paper shadow-card transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {project.external_link_label || "Learn more"}
          </a>
        )}

        <a
          href={`/api/vcard/${profile.username}`}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
        >
          <i className="fa-solid fa-address-card" />
          Save {displayName}&apos;s Contact
        </a>

        <div className="mt-10 text-center">
          <Link href={`/p/${profile.username}`} className="text-sm font-medium text-ink underline underline-offset-4">
            ← Back to {displayName}&apos;s profile
          </Link>
        </div>

        <footer className="mt-10 border-t border-line pt-6 text-center">
          <p className="text-xs text-graphite">
            Powered by <span className="prism-text font-bold">Forge</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
