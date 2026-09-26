"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { slugify } from "@/lib/utils";
import type { PortfolioItem, Profile, Service } from "@/lib/types";

type PortfolioDraft = {
  id: string; // stable client-side key: the DB id if it exists, otherwise a generated temp id
  dbId?: string;
  kind: "single" | "compare";
  caption: string;
  imageUrl: string | null;
  file: File | null;
  previewUrl: string | null;
  beforeImageUrl: string | null;
  beforeFile: File | null;
  beforePreviewUrl: string | null;
  afterImageUrl: string | null;
  afterFile: File | null;
  afterPreviewUrl: string | null;
  markedForDelete?: boolean;
};

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    company_name: "",
    profession: "",
    bio: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    tiktok: "",
    twitter: "",
    youtube: "",
    pinterest: "",
    whatsapp: "",
    yelp: "",
    google_reviews: "",
    google_place_id: "",
    google_rating: "",
    google_rating_count: "",
    show_google_rating: false,
    service_area: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  const [portfolio, setPortfolio] = useState<PortfolioDraft[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const [showCompareForm, setShowCompareForm] = useState(false);
  const [compareBeforeFile, setCompareBeforeFile] = useState<File | null>(null);
  const [compareAfterFile, setCompareAfterFile] = useState<File | null>(null);
  const [compareBeforePreview, setCompareBeforePreview] = useState<string | null>(null);
  const [compareAfterPreview, setCompareAfterPreview] = useState<string | null>(null);
  const [compareCaption, setCompareCaption] = useState("");

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

      if (profile) {
        setProfileId(profile.id);
        setForm({
          username: profile.username || "",
          full_name: profile.full_name || "",
          company_name: profile.company_name || "",
          profession: profile.profession || "",
          bio: profile.bio || "",
          phone: profile.phone || "",
          email: profile.email || "",
          website: profile.website || "",
          instagram: profile.instagram || "",
          facebook: profile.facebook || "",
          linkedin: profile.linkedin || "",
          tiktok: profile.tiktok || "",
          twitter: profile.twitter || "",
          youtube: profile.youtube || "",
          pinterest: profile.pinterest || "",
          whatsapp: profile.whatsapp || "",
          yelp: profile.yelp || "",
          google_reviews: profile.google_reviews || "",
          google_place_id: profile.google_place_id || "",
          google_rating: profile.google_rating != null ? String(profile.google_rating) : "",
          google_rating_count: profile.google_rating_count != null ? String(profile.google_rating_count) : "",
          show_google_rating: profile.show_google_rating || false,
          service_area: profile.service_area || "",
        });
        setPhotoPreview(profile.profile_photo_url);
        setLogoPreview(profile.logo_url);

        const { data: svc } = await supabase
          .from("services")
          .select("*")
          .eq("profile_id", profile.id)
          .order("created_at")
          .returns<Service[]>();
        setServices((svc || []).map((s) => s.name));

        const { data: items } = await supabase
          .from("portfolio_items")
          .select("*")
          .eq("profile_id", profile.id)
          .order("sort_order")
          .returns<PortfolioItem[]>();
        setPortfolio(
          (items || []).map((p) => ({
            id: p.id,
            dbId: p.id,
            kind: p.kind === "compare" ? "compare" : "single",
            caption: p.caption || "",
            imageUrl: p.image_url,
            file: null,
            previewUrl: p.image_url,
            beforeImageUrl: p.before_image_url,
            beforeFile: null,
            beforePreviewUrl: p.before_image_url,
            afterImageUrl: p.after_image_url,
            afterFile: null,
            afterPreviewUrl: p.after_image_url,
          }))
        );
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleShowGoogleRating(checked: boolean) {
    setForm((f) => ({ ...f, show_google_rating: checked }));
  }

  function addService() {
    const trimmed = newService.trim();
    if (!trimmed) return;
    setServices((s) => [...s, trimmed]);
    setNewService("");
  }

  function removeService(index: number) {
    setServices((s) => s.filter((_, i) => i !== index));
  }

  function addPortfolioFiles(files: FileList) {
    const drafts: PortfolioDraft[] = Array.from(files).map((file) => ({
      id: newId(),
      kind: "single",
      caption: "",
      imageUrl: null,
      file,
      previewUrl: URL.createObjectURL(file),
      beforeImageUrl: null,
      beforeFile: null,
      beforePreviewUrl: null,
      afterImageUrl: null,
      afterFile: null,
      afterPreviewUrl: null,
    }));
    setPortfolio((p) => [...p, ...drafts]);
  }

  function confirmCompareItem() {
    if (!compareBeforeFile || !compareAfterFile) return;
    const item: PortfolioDraft = {
      id: newId(),
      kind: "compare",
      caption: compareCaption,
      imageUrl: null,
      file: null,
      previewUrl: null,
      beforeImageUrl: null,
      beforeFile: compareBeforeFile,
      beforePreviewUrl: compareBeforePreview,
      afterImageUrl: null,
      afterFile: compareAfterFile,
      afterPreviewUrl: compareAfterPreview,
    };
    setPortfolio((p) => [...p, item]);
    setShowCompareForm(false);
    setCompareBeforeFile(null);
    setCompareAfterFile(null);
    setCompareBeforePreview(null);
    setCompareAfterPreview(null);
    setCompareCaption("");
  }

  function updatePortfolioCaption(id: string, caption: string) {
    setPortfolio((p) => p.map((item) => (item.id === id ? { ...item, caption } : item)));
  }

  function removePortfolioItem(id: string) {
    setPortfolio((p) => p.map((item) => (item.id === id ? { ...item, markedForDelete: true } : item)));
  }

  // Drag-to-reorder: works with mouse and touch via the Pointer Events API.
  // Dragging past a neighboring item's midpoint live-swaps it into that slot.
  function handleGripDown(e: ReactPointerEvent<HTMLSpanElement>, id: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragId(id);
  }
  function handleGripMove(e: ReactPointerEvent<HTMLSpanElement>) {
    if (dragId == null || !listRef.current) return;
    const visible = portfolio.filter((p) => !p.markedForDelete);
    const nodes = Array.from(listRef.current.querySelectorAll("[data-portfolio-row]"));
    const currentIndex = visible.findIndex((p) => p.id === dragId);
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
    targetIndex = Math.max(0, Math.min(visible.length - 1, targetIndex));
    if (targetIndex !== currentIndex) {
      const reordered = [...visible];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      const deletedOnes = portfolio.filter((p) => p.markedForDelete);
      setPortfolio([...reordered, ...deletedOnes]);
    }
  }
  function handleGripUp() {
    setDragId(null);
  }

  async function uploadImage(bucket: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      let profile_photo_url = photoPreview;
      if (photoFile) profile_photo_url = await uploadImage("profile-photos", photoFile);

      let logo_url = logoPreview;
      if (logoFile) logo_url = await uploadImage("logos", logoFile);

      const usernameSlug = slugify(form.username || form.full_name || "profile");

      const payload = {
        user_id: userId,
        username: usernameSlug,
        full_name: form.full_name || null,
        company_name: form.company_name || null,
        profession: form.profession || null,
        bio: form.bio || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        linkedin: form.linkedin || null,
        tiktok: form.tiktok || null,
        twitter: form.twitter || null,
        youtube: form.youtube || null,
        pinterest: form.pinterest || null,
        whatsapp: form.whatsapp || null,
        yelp: form.yelp || null,
        google_reviews: form.google_reviews || null,
        google_place_id: form.google_place_id || null,
        google_rating: form.google_rating ? parseFloat(form.google_rating) : null,
        google_rating_count: form.google_rating_count ? parseInt(form.google_rating_count, 10) : null,
        show_google_rating: form.show_google_rating,
        service_area: form.service_area || null,
        profile_photo_url,
        logo_url,
        updated_at: new Date().toISOString(),
      };

      const upsertPayload = profileId ? { id: profileId, ...payload } : payload;

      const { data: savedProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert(upsertPayload, { onConflict: "user_id" })
        .select("*")
        .single();

      if (profileError) throw profileError;
      const pid = savedProfile.id as string;
      setProfileId(pid);

      // Services: replace all
      await supabase.from("services").delete().eq("profile_id", pid);
      if (services.length > 0) {
        await supabase.from("services").insert(services.map((name) => ({ profile_id: pid, name })));
      }

      // Portfolio: delete marked items
      const toDelete = portfolio.filter((p) => p.markedForDelete && p.dbId);
      if (toDelete.length > 0) {
        await supabase.from("portfolio_items").delete().in("id", toDelete.map((p) => p.dbId!));
      }

      // Portfolio: save each remaining item (in its current order) so
      // sort_order always reflects the latest drag-and-drop arrangement.
      const remaining = portfolio.filter((p) => !p.markedForDelete);
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (item.kind === "single") {
          const image_url = item.file ? await uploadImage("portfolio", item.file) : item.imageUrl;
          if (item.dbId) {
            await supabase
              .from("portfolio_items")
              .update({ caption: item.caption || null, sort_order: i, image_url })
              .eq("id", item.dbId);
          } else {
            await supabase.from("portfolio_items").insert({
              profile_id: pid,
              kind: "single",
              image_url,
              caption: item.caption || null,
              sort_order: i,
            });
          }
        } else {
          const before_image_url = item.beforeFile ? await uploadImage("portfolio", item.beforeFile) : item.beforeImageUrl;
          const after_image_url = item.afterFile ? await uploadImage("portfolio", item.afterFile) : item.afterImageUrl;
          if (item.dbId) {
            await supabase
              .from("portfolio_items")
              .update({ caption: item.caption || null, sort_order: i, before_image_url, after_image_url })
              .eq("id", item.dbId);
          } else {
            await supabase.from("portfolio_items").insert({
              profile_id: pid,
              kind: "compare",
              before_image_url,
              after_image_url,
              caption: item.caption || null,
              sort_order: i,
            });
          }
        }
      }

      setPhotoFile(null);
      setLogoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      const { data: freshItems } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("profile_id", pid)
        .order("sort_order")
        .returns<PortfolioItem[]>();
      setPortfolio(
        (freshItems || []).map((p) => ({
          id: p.id,
          dbId: p.id,
          kind: p.kind === "compare" ? "compare" : "single",
          caption: p.caption || "",
          imageUrl: p.image_url,
          file: null,
          previewUrl: p.image_url,
          beforeImageUrl: p.before_image_url,
          beforeFile: null,
          beforePreviewUrl: p.before_image_url,
          afterImageUrl: p.after_image_url,
          afterFile: null,
          afterPreviewUrl: p.after_image_url,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong saving your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-graphite">Loading your profile…</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Edit profile
          </h1>
          <p className="mt-1 text-sm text-graphite">This is what customers see when they scan your code.</p>
        </div>
        <LinkButton href={`/p/${form.username || ""}`} variant="secondary" className="shrink-0">
          Preview
        </LinkButton>
      </div>

      <div className="mt-8 space-y-8">
        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Identity</h2>
          <div className="mt-5 flex flex-wrap gap-6">
            <ImageUpload
              label="Profile photo"
              shape="circle"
              previewUrl={photoPreview}
              onFileSelected={(file) => {
                setPhotoFile(file);
                setPhotoPreview(URL.createObjectURL(file));
              }}
            />
            <ImageUpload
              label="Cover banner"
              aspect={2.2}
              previewUrl={logoPreview}
              onFileSelected={(file) => {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Public URL username" hint={`forge.app/p/${slugify(form.username || "yourname")}`}>
              <Input value={form.username} onChange={(e) => updateField("username", e.target.value)} />
            </Field>
            <Field label="Full name">
              <Input value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
            </Field>
            <Field label="Company name">
              <Input value={form.company_name} onChange={(e) => updateField("company_name", e.target.value)} />
            </Field>
            <Field label="Job title / profession">
              <Input value={form.profession} onChange={(e) => updateField("profession", e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Short bio">
              <Textarea rows={4} value={form.bio} onChange={(e) => updateField("bio", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Contact</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Phone number">
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => updateField("website", e.target.value)} />
            </Field>
            <Field label="Service area">
              <Input value={form.service_area} onChange={(e) => updateField("service_area", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Social & reviews</h2>
          <p className="mt-1 text-sm text-graphite">Leave any of these blank to hide them from your public profile.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp" hint="Phone number or wa.me link">
              <Input value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} />
            </Field>
            <Field label="Instagram URL">
              <Input value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} />
            </Field>
            <Field label="TikTok URL">
              <Input value={form.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} />
            </Field>
            <Field label="Facebook URL">
              <Input value={form.facebook} onChange={(e) => updateField("facebook", e.target.value)} />
            </Field>
            <Field label="X (Twitter) URL">
              <Input value={form.twitter} onChange={(e) => updateField("twitter", e.target.value)} />
            </Field>
            <Field label="YouTube URL">
              <Input value={form.youtube} onChange={(e) => updateField("youtube", e.target.value)} />
            </Field>
            <Field label="Pinterest URL">
              <Input value={form.pinterest} onChange={(e) => updateField("pinterest", e.target.value)} />
            </Field>
            <Field label="LinkedIn URL">
              <Input value={form.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} />
            </Field>
            <Field label="Yelp URL">
              <Input value={form.yelp} onChange={(e) => updateField("yelp", e.target.value)} />
            </Field>
            <Field label="Google Reviews URL">
              <Input value={form.google_reviews} onChange={(e) => updateField("google_reviews", e.target.value)} />
            </Field>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-paper p-4">
            <Toggle
              checked={form.show_google_rating}
              onChange={toggleShowGoogleRating}
              label="Show a Google rating on your profile"
              hint="Off by default — turn this on only if you want your rating shown."
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Rating" hint="e.g. 4.8">
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.google_rating}
                  onChange={(e) => updateField("google_rating", e.target.value)}
                  placeholder="4.8"
                />
              </Field>
              <Field label="Number of reviews" hint="e.g. 127">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.google_rating_count}
                  onChange={(e) => updateField("google_rating_count", e.target.value)}
                  placeholder="127"
                />
              </Field>
            </div>
            <p className="mt-3 text-xs text-graphite">
              You enter these yourself — just copy the numbers from your actual Google Business listing. Update
              them here anytime; nothing connects to Google automatically.
            </p>
          </div>

          <details className="mt-4 rounded-xl border border-dashed border-line p-4">
            <summary className="cursor-pointer text-sm font-medium text-ink">
              Advanced: auto-sync from Google instead
            </summary>
            <div className="mt-3">
              <Field
                label="Google Place ID"
                hint="Requires a Google Cloud API key set up separately. Find your Place ID at developers.google.com/maps/documentation/places/web-service/place-id"
              >
                <Input
                  value={form.google_place_id}
                  onChange={(e) => updateField("google_place_id", e.target.value)}
                  placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                />
              </Field>
            </div>
          </details>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Services</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {services.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="text-graphite hover:text-ink"
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="e.g. Kitchen remodels"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addService();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addService}>
              Add
            </Button>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Portfolio</h2>
          <p className="mt-1 text-sm text-graphite">
            Add regular project photos, or a before/after pair visitors can drag to compare. Use the grip to reorder.
          </p>

          <div ref={listRef} className="mt-5 flex flex-col gap-2.5">
            {portfolio
              .filter((item) => !item.markedForDelete)
              .map((item) => (
                <div
                  key={item.id}
                  data-portfolio-row
                  className={`card flex items-center gap-3 p-2.5 ${dragId === item.id ? "opacity-60" : ""}`}
                >
                  <span
                    onPointerDown={(e) => handleGripDown(e, item.id)}
                    onPointerMove={handleGripMove}
                    onPointerUp={handleGripUp}
                    onPointerCancel={handleGripUp}
                    className="shrink-0 cursor-grab touch-none px-1 py-1 text-graphite"
                    aria-label="Drag to reorder"
                  >
                    <i className="fa-solid fa-grip-vertical" />
                  </span>

                  {item.kind === "compare" ? (
                    <div className="flex h-14 w-[72px] shrink-0 overflow-hidden rounded-lg border border-line">
                      {item.beforePreviewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.beforePreviewUrl} alt="" className="h-full w-1/2 object-cover" />
                      )}
                      {item.afterPreviewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.afterPreviewUrl} alt="" className="h-full w-1/2 object-cover" />
                      )}
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl || ""}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    {item.kind === "compare" && <span className="eyebrow mb-1 block">Before / after slider</span>}
                    <Input
                      placeholder="Caption"
                      value={item.caption}
                      onChange={(e) => updatePortfolioCaption(item.id, e.target.value)}
                      className="!py-1.5 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removePortfolioItem(item.id)}
                    aria-label="Remove"
                    className="shrink-0 rounded-full p-1.5 text-graphite hover:bg-ink/5 hover:text-ink"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <label className="focus-ring cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30">
              + Add photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) addPortfolioFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowCompareForm((s) => !s)}
              className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30"
            >
              + Add before/after
            </button>
          </div>

          {showCompareForm && (
            <div className="mt-4 rounded-2xl border border-dashed border-line p-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">Before photo</span>
                  <label className="focus-ring flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-white text-xs text-graphite hover:border-ink/40">
                    {compareBeforePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={compareBeforePreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      "Upload"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCompareBeforeFile(file);
                          setCompareBeforePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">After photo</span>
                  <label className="focus-ring flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-white text-xs text-graphite hover:border-ink/40">
                    {compareAfterPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={compareAfterPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      "Upload"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCompareAfterFile(file);
                          setCompareAfterPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="mt-3">
                <Input
                  placeholder="Caption (optional)"
                  value={compareCaption}
                  onChange={(e) => setCompareCaption(e.target.value)}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <Button type="button" variant="secondary" className="!px-4 !py-2 text-sm" onClick={() => setShowCompareForm(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="prism-glow !px-4 !py-2 text-sm"
                  disabled={!compareBeforeFile || !compareAfterFile}
                  onClick={confirmCompareItem}
                >
                  Add to portfolio
                </Button>
              </div>
            </div>
          )}
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-4 pb-10">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-sm text-graphite">Saved.</span>}
        </div>
      </div>
    </div>
  );
}
