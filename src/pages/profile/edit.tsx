// pages/profile/edit.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import Page from "@/components/Page";

type Creative = {
  display_name: string;
  category?: string | null;
  subcategory?: string | null;
  location: string;
  bio: string;
  website: string;
  avatar_url: string | null;
  verified: boolean;
  tags: string[];
};

/* ------------------------- CategorySelect ------------------------- */
function CategorySelect({
  value,
  onChange,
  options,
  error,
  label = "Category",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  error?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(0, options.findIndex((o) => o === value))
  );
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(options.length - 1, i + 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const choice = options[activeIndex] ?? options[0];
        onChange(choice);
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey as any);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey as any);
    };
  }, [open, options, activeIndex, onChange]);

  useEffect(() => {
    const idx = options.findIndex((o) => o === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, options]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`mt-1 w-full flex items-center justify-between rounded-md border px-3 py-2 text-left focus:outline-none focus:ring-2 ${
          error ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
        } bg-white`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{value || "Select a category"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 w-full rounded-xl bg-white/80 backdrop-blur-md shadow-lg border border-black/10 overflow-hidden"
        >
          {options.map((opt, i) => {
            const selected = opt === value;
            const active = i === activeIndex;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => { onChange(opt); setOpen(false); btnRef.current?.focus(); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition ${
                  active ? "bg-gray-50" : "bg-transparent"
                } ${selected ? "font-semibold text-gray-900" : "text-gray-800"}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ TagInput ------------------------------ */
function TagInput({
  value,
  onChange,
  placeholder = "Add tags (Enter/Space/Comma)",
  maxTags = 10,
  maxLength = 24,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
}) {
  const [draft, setDraft] = useState("");
  const commit = (raw: string) => {
    let t = raw.trim();
    if (!t) return;
    t = t.replace(/[,\s]+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
    if (!t) return;
    if (t.length > maxLength) t = t.slice(0, maxLength);
    if (value.includes(t)) return;
    if (value.length >= maxTags) return;
    onChange([...value, t]);
    setDraft("");
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", "Tab", ","].includes(e.key)) { e.preventDefault(); commit(draft); }
    else if (e.key === "Backspace" && !draft && value.length) { onChange(value.slice(0, -1)); }
  };
  const removeAt = (i: number) => { const next = value.slice(); next.splice(i, 1); onChange(next); };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Tags</label>
      <div className="mt-1 w-full min-h-[42px] rounded-md border border-black/10 px-2 py-1.5 bg-white focus-within:ring-2 focus-within:ring-royal-purple/60 flex flex-wrap gap-1.5">
        {value.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-royal-purple/10 text-royal-purple border border-royal-purple/20"
          >
            {t}
            <button type="button" onClick={() => removeAt(i)} className="rounded-full p-0.5 hover:bg-royal-purple/10" aria-label={`Remove ${t}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[140px] px-2 py-1 text-sm focus:outline-none bg-transparent"
        />
      </div>
      <div className="mt-1 text-[11px] text-gray-500">
        Separate with <span className="font-medium text-royal-purple">Space</span> or{" "}
        <span className="font-medium text-royal-purple">Enter</span>. Up to {maxTags} tags.
      </div>
    </div>
  );
}

/* ------------------------------ Options ------------------------------ */
const CATEGORY_OPTIONS = ["DJ","Artist","Studio","Photographer","Merchant","Singer","Rapper","Influencer","Other"];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form state
  const [display_name, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [website, setWebsite] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [serverAvatar, setServerAvatar] = useState<string | null>(null);

  // load current profile (no-cache)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        // NOTE: this assumes you have a Next.js API route that proxies to Django
        const r = await fetch("/api/me/profile", { cache: "no-store" });
        if (r.status === 401) { router.replace("/login"); return; }
        const j: Creative = await r.json();
        if (!r.ok) throw new Error((j as any)?.error || "Failed to load profile");

        if (!mounted) return;
        setDisplayName(j.display_name || "");
        setLocation(j.location || "");
        setBio(j.bio || "");
        setWebsite(j.website || "");
        setTags(Array.isArray(j.tags) ? j.tags : []);
        setCategory(j.category || "");
        setSubcategory(j.subcategory || "");
        setServerAvatar(j.avatar_url || null);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  // avatar preview
  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(null); return; }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const canSubmit = useMemo(() => !loading && !saving, [loading, saving]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setSaving(true);
    try {
      let r: Response;

      if (avatarFile) {
        // multipart PATCH (correct key is "avatar")
        const fd = new FormData();
        fd.append("display_name", display_name);
        if (location) fd.append("location", location);
        if (category) fd.append("category", category);
        if (subcategory) fd.append("subcategory", subcategory);
        if (bio) fd.append("bio", bio);
        if (website) fd.append("website", website);
        if (tags.length) fd.append("tags", JSON.stringify(tags));
        fd.append("avatar", avatarFile, avatarFile.name);

        r = await fetch("/api/me/profile", {
          method: "PATCH",
          body: fd,              // let the browser set multipart boundary
          cache: "no-store",
        });
      } else {
        // JSON PATCH
        r = await fetch("/api/me/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name,
            location,
            bio,
            website,
            category,
            subcategory,
            tags,                 // array is fine; backend accepts list or JSON string
          }),
          cache: "no-store",
        });
      }

      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { router.replace("/login"); return; }
      if (!r.ok) {
        // show field errors if any
        if (j && typeof j === "object") throw new Error(j.detail || j.error || JSON.stringify(j));
        throw new Error("Update failed");
      }

      // update UI immediately with server's latest avatar url if returned
      if (j?.avatar_url) setServerAvatar(j.avatar_url);
      setAvatarFile(null);
      setAvatarPreview(null);

      // go back to profile page (or comment this out to stay)
      router.replace("/profile");
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <section className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <p className="text-sm text-gray-600">Update your public profile details.</p>

        <form onSubmit={onSubmit} className="mt-6 bg-white rounded-xl shadow p-6 space-y-6" noValidate>
          {/* Avatar 
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile picture</label>
            <label
              className="mt-2 flex items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer hover:bg-gray-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setAvatarFile(e.dataTransfer.files[0]); }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 grid place-items-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="New preview" className="w-full h-full object-cover" />
                ) : serverAvatar ? (
                  <img src={serverAvatar} alt="Current avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src="/user.png" alt="Default avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="text-sm text-gray-700">
                <div className="font-medium">Upload or drop an image</div>
                <div className="text-gray-500">PNG/JPG up to ~2MB recommended</div>
              </div>
            </label>
          </div>*/}

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Display name</label>
            <input
              value={display_name}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
              placeholder="Your stage or brand name"
            />
          </div>

          {/* Category */}
          <CategorySelect value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subcategory</label>
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. DJ"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location <span className="text-xs text-gray-500">(City, Country)</span>
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nairobi, Kenya"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about your creative practice…"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
          </div>

          {/* Tags */}
          <TagInput value={tags} onChange={setTags} />

          {/* Errors */}
          {err && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
              {err}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="px-4 py-2 rounded-full bg-sanaa-orange text-white hover:bg-sanaa-orange/90"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2 rounded-full bg-royal-purple text-white font-semibold ${
                canSubmit ? "hover:bg-royal-purple/90" : "opacity-60 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </Page>
  );
}
