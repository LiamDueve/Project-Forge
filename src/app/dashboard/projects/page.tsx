"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import type { Profile, Project } from "@/lib/types";

const NAME_PRESETS = [
  "Projects",
  "My Work",
  "Portfolio",
  "Listings",
  "Developments",
  "Case Studies",
  "Ventures",
  "Recent Work",
  "Completed Projects",
];

export default function ProjectsListPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [sectionEnabled, setSectionEnabled] = useState(false);
  const [sectionName, setSectionName] = useState("Projects");
  const [projects, setProjects] = useState<Project[]>([]);

  const listRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

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
      setSectionEnabled(profile.projects_section_enabled);
      setSectionName(profile.projects_section_name || "Projects");

      const { data: items } = await supabase
        .from("projects")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order")
        .returns<Project[]>();
      setProjects(items || []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveSettings() {
    if (!profileId) return;
    setSaving(true);
    setError(null);
    try {
      const { error: saveError } = await supabase
        .from("profiles")
        .update({
          projects_section_enabled: sectionEnabled,
          projects_section_name: sectionName.trim() || "Projects",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);
      if (saveError) throw saveError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong saving your section settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddProject() {
    if (!profileId) return;
    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        profile_id: profileId,
        title: "Untitled project",
        sort_order: projects.length,
      })
      .select("*")
      .single<Project>();
    if (insertError || !data) {
      setError(insertError?.message || "Couldn't create a new project.");
      return;
    }
    router.push(`/dashboard/projects/${data.id}`);
  }

  async function handleDelete(id: string) {
    const prev = projects;
    setProjects((p) => p.filter((item) => item.id !== id));
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", id);
    if (deleteError) {
      setProjects(prev);
      setError(deleteError.message);
    }
  }

  async function persistOrder(ordered: Project[]) {
    await Promise.all(ordered.map((item, i) => supabase.from("projects").update({ sort_order: i }).eq("id", item.id)));
  }

  function handleGripDown(e: ReactPointerEvent<HTMLSpanElement>, id: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragId(id);
  }
  function handleGripMove(e: ReactPointerEvent<HTMLSpanElement>) {
    if (dragId == null || !listRef.current) return;
    const nodes = Array.from(listRef.current.querySelectorAll("[data-project-row]"));
    const currentIndex = projects.findIndex((p) => p.id === dragId);
    if (currentIndex === -1) return;
    let targetIndex = currentIndex;
    for (let i = 0; i < nodes.length; i++) {
      const rect = nodes[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        targetIndex = i;
        break;
      }
      targetIndex = i + 1;
    }
    targetIndex = Math.max(0, Math.min(projects.length - 1, targetIndex));
    if (targetIndex !== currentIndex) {
      setProjects((prev) => {
        const next = [...prev];
        const [moved] = next.splice(currentIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
    }
  }
  function handleGripUp() {
    setDragId(null);
    persistOrder(projects);
  }

  if (loading) {
    return <p className="text-sm text-graphite">Loading your projects…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {sectionName || "Projects"}
      </h1>
      <p className="mt-1 max-w-lg text-sm text-graphite">
        Forge tells people who you are — this section shows what you actually do. Works for listings, projects,
        case studies, ventures, or anything you want to showcase.
      </p>

      <section className="card mt-6 p-6">
        <Toggle
          checked={sectionEnabled}
          onChange={setSectionEnabled}
          label="Show this section on your public profile"
          hint="Off by default until you've added at least one project."
        />

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-ink">Section name</label>
          <Input value={sectionName} onChange={(e) => setSectionName(e.target.value)} placeholder="Projects" />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {NAME_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSectionName(preset)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  sectionName === preset
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-graphite hover:border-ink/30"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex items-center gap-4">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
          {saved && <span className="text-sm text-graphite">Saved.</span>}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Your {sectionName.toLowerCase() || "projects"}</h2>
          <Button className="prism-glow !px-4 !py-2 text-sm" onClick={handleAddProject}>
            + New project
          </Button>
        </div>

        {projects.length === 0 ? (
          <p className="mt-4 text-sm text-graphite">
            Nothing here yet — add your first one to bring this section to life.
          </p>
        ) : (
          <div ref={listRef} className="mt-4 flex flex-col gap-2.5">
            {projects.map((project) => (
              <div
                key={project.id}
                data-project-row
                className={`card flex items-center gap-3 p-3 ${dragId === project.id ? "opacity-60" : ""}`}
              >
                <span
                  onPointerDown={(e) => handleGripDown(e, project.id)}
                  onPointerMove={handleGripMove}
                  onPointerUp={handleGripUp}
                  onPointerCancel={handleGripUp}
                  className="shrink-0 cursor-grab touch-none px-1 py-1 text-graphite"
                  aria-label="Drag to reorder"
                >
                  <i className="fa-solid fa-grip-vertical" />
                </span>

                {project.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.cover_image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-line bg-paper text-graphite">
                    <i className="fa-regular fa-image" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{project.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-graphite">
                    {project.status && <span>{project.status}</span>}
                    {!project.is_public && (
                      <span className="rounded-full bg-line px-2 py-0.5 text-[0.65rem] font-medium text-graphite">
                        Private
                      </span>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  className="focus-ring shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink/30"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project.id)}
                  aria-label="Delete"
                  className="shrink-0 rounded-full p-1.5 text-graphite hover:bg-ink/5 hover:text-ink"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
