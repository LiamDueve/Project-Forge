"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { RepeatableRows, newId } from "@/components/dashboard/RepeatableRows";
import { getSiteUrl } from "@/lib/utils";
import type { Project, ProjectCustomField } from "@/lib/types";

type GalleryDraft = { id: string; url: string | null; file: File | null; previewUrl: string | null; markedForDelete?: boolean };

export default function ProjectEditorPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<GalleryDraft[]>([]);
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [customFields, setCustomFields] = useState<ProjectCustomField[]>([]);
  const [isPublic, setIsPublic] = useState(true);

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

      const { data: profile } = await supabase.from("profiles").select("username").eq("user_id", user.id).maybeSingle();
      if (profile) setUsername(profile.username);

      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .maybeSingle<Project>();

      if (!project) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(project.title || "");
      setCoverUrl(project.cover_image_url);
      setGallery(
        (project.gallery_images || []).map((url) => ({
          id: newId(),
          url,
          file: null,
          previewUrl: url,
        }))
      );
      setShortDescription(project.short_description || "");
      setFullDescription(project.full_description || "");
      setStatus(project.status || "");
      setLocation(project.location || "");
      setProjectDate(project.project_date || "");
      setLinkUrl(project.external_link_url || "");
      setLinkLabel(project.external_link_label || "");
      setCustomFields(project.custom_fields || []);
      setIsPublic(project.is_public);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    return supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
  }

  function addGalleryFiles(files: FileList) {
    const drafts: GalleryDraft[] = Array.from(files).map((file) => ({
      id: newId(),
      url: null,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setGallery((g) => [...g, ...drafts]);
  }
  function removeGalleryImage(id: string) {
    setGallery((g) => g.map((item) => (item.id === id ? { ...item, markedForDelete: true } : item)));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      let cover_image_url = coverUrl;
      if (coverFile) cover_image_url = await uploadImage(coverFile);

      const finalGallery: string[] = [];
      for (const item of gallery.filter((g) => !g.markedForDelete)) {
        if (item.file) finalGallery.push(await uploadImage(item.file));
        else if (item.url) finalGallery.push(item.url);
      }

      const { error: saveError } = await supabase
        .from("projects")
        .update({
          title: title.trim() || "Untitled project",
          cover_image_url,
          gallery_images: finalGallery,
          short_description: shortDescription || null,
          full_description: fullDescription || null,
          status: status || null,
          location: location || null,
          project_date: projectDate || null,
          external_link_url: linkUrl || null,
          external_link_label: linkLabel || null,
          custom_fields: customFields,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (saveError) throw saveError;

      setCoverFile(null);
      setCoverUrl(cover_image_url);
      setGallery(finalGallery.map((url) => ({ id: newId(), url, file: null, previewUrl: url })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong saving this project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await supabase.from("projects").delete().eq("id", params.id);
    router.push("/dashboard/projects");
  }

  if (loading) return <p className="text-sm text-graphite">Loading…</p>;
  if (notFound) return <p className="text-sm text-graphite">Project not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <LinkButton href="/dashboard/projects" variant="ghost" className="!px-0 !py-0 text-sm text-graphite">
            ← Back to list
          </LinkButton>
          <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Edit project</h1>
        </div>
        {isPublic && username && (
          <a
            href={`${getSiteUrl()}/p/${username}/projects/${params.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30"
          >
            View public page
          </a>
        )}
      </div>

      <div className="mt-6 space-y-5">
        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Basics</h2>
          <div className="mt-4 space-y-4">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="123 Main Street" />
            </Field>
            <ImageUpload label="Cover image" aspect={1.5} previewUrl={coverUrl} onFileSelected={(f) => { setCoverFile(f); setCoverUrl(URL.createObjectURL(f)); }} />
            <Field label="Short description" hint="Shown on the card in your profile's list — keep it brief.">
              <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="4 bed, 4.5 bath — For Sale" />
            </Field>
            <Field label="Full description" hint="Shown on the project's detail page.">
              <Textarea rows={5} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Gallery</h2>
          <p className="mt-1 text-sm text-graphite">Additional photos shown on the project's detail page.</p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {gallery
              .filter((g) => !g.markedForDelete)
              .map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-white">
                  {item.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(item.id)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-paper"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            <label className="focus-ring flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-line bg-white text-xs text-graphite hover:border-ink/40">
              + Add
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) addGalleryFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Status" hint="e.g. For Sale, Sold, Completed, Under Construction">
              <Input value={status} onChange={(e) => setStatus(e.target.value)} />
            </Field>
            <Field label="Location" hint="Optional">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field>
            <Field label="Date / year" hint="Optional — any format, e.g. 2027 or Spring 2026">
              <Input value={projectDate} onChange={(e) => setProjectDate(e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Custom fields</h2>
          <p className="mt-1 text-sm text-graphite">
            Whatever's relevant to this project — Price/Beds/Baths, Units/Completion, Client/Year, anything.
          </p>
          <div className="mt-4">
            <RepeatableRows
              items={customFields}
              onChange={setCustomFields}
              addLabel="Add field"
              emptyHint="No custom fields yet."
              newItem={() => ({ id: newId(), label: "", value: "" })}
              renderRow={(item, update, remove) => (
                <div className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
                  <Input value={item.label} placeholder="Label" onChange={(e) => update({ label: e.target.value })} className="!py-1.5 text-xs" />
                  <Input value={item.value} placeholder="Value" onChange={(e) => update({ value: e.target.value })} className="!py-1.5 text-xs" />
                  <button type="button" onClick={remove} aria-label="Remove" className="flex h-7 w-7 items-center justify-center rounded-full text-graphite hover:bg-ink/5 hover:text-ink">
                    ×
                  </button>
                </div>
              )}
            />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Link & CTA</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Button text" hint="e.g. Schedule a Showing, View Listing">
              <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Learn more" />
            </Field>
            <Field label="Link URL">
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
            </Field>
          </div>
        </section>

        <section className="card p-6">
          <Toggle
            checked={isPublic}
            onChange={setIsPublic}
            label="Visible on your public profile"
            hint="Turn off to keep this as a private draft."
          />
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pb-10">
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {saved && <span className="text-sm text-graphite">Saved.</span>}
          </div>
          <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
}
