// pages/profile/edit.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import Page from "@/components/Page";

type SocialLinks = {
  x?: string;
  tiktok?: string;
  instagram?: string;
  facebook?: string;
};

type Creative = {
  display_name: string;
  category?: string | null;
  subcategory?: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  verified: boolean;
  // suspended?: boolean; // available on backend, but we don't edit here
  tags: string[] | null;
  social_links?: SocialLinks | null;
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
                className={`w-full text-left px-4 py-2.5 text-sm transition ${active ? "bg-gray-50" : "bg-transparent"} ${
                  selected ? "font-semibold text-gray-900" : "text-gray-800"
                }`}
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
        Separate with <span className="font-medium text-royal-purple">Space</span>{" "}
        or <span className="font-medium text-royal-purple">Enter</span>. Up to {maxTags} tags.
      </div>
    </div>
  );
}

/* ------------------------------ SocialHandles ------------------------------ */
function normalizeHandle(raw?: string | null): string {
  const v = (raw || "").trim();
  if (!v) return "";
  // If full URL, take last path segment
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      const last = u.pathname.split("/").filter(Boolean).pop() || "";
      return last.replace(/^@+/, "");
    } catch {
      // fall-through
    }
  }
  return v.replace(/^@+/, "").split(/[?#]/)[0];
}

function SocialHandles({
  value,
  onChange,
}: {
  value: SocialLinks;
  onChange: (next: SocialLinks) => void;
}) {
  const Row = ({
    label, name, icon, placeholder, prefixAt = true,
  }: {
    label: string;
    name: keyof SocialLinks;
    icon: string;
    placeholder: string;
    prefixAt?: boolean;
  }) => (
    <div className="flex items-center gap-3">
      <img src={icon} alt={`${label} icon`} className="w-5 h-5 opacity-80" />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex items-center rounded-md border border-black/10 focus-within:ring-2 focus-within:ring-royal-purple/60 bg-white">
          {prefixAt && <span className="pl-3 pr-1 text-gray-500">@</span>}
          <input
            value={value[name] || ""}
            onChange={(e) => onChange({ ...value, [name]: normalizeHandle(e.target.value) })}
            placeholder={placeholder}
            className="flex-1 px-2 py-2 rounded-r-md focus:outline-none bg-transparent"
          />
        </div>
        <p className="mt-1 text-[11px] text-gray-500">Paste a profile URL or handle; we’ll clean it.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Social handles</h3>
      <Row label="X"         name="x"         icon="/x.png"          placeholder="yourhandle" />
      <Row label="TikTok"    name="tiktok"    icon="/tiktok.png"     placeholder="yourhandle" />
      <Row label="Instagram" name="instagram" icon="/instagram.png"  placeholder="yourhandle" />
      <Row label="Facebook"  name="facebook"  icon="/facebook.png"   placeholder="yourhandle" />
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
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // backend stores URL string

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ x: "", tiktok: "", instagram: "", facebook: "" });

  // load current profile (no-cache)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const r = await fetch("/api/me/profile", { cache: "no-store", credentials: "include" });
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
        setAvatarUrl(j.avatar_url || "");

        const s = j.social_links || {};
        setSocialLinks({
          x: normalizeHandle(s.x),
          tiktok: normalizeHandle(s.tiktok),
          instagram: normalizeHandle(s.instagram),
          facebook: normalizeHandle(s.facebook),
        });
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const canSubmit = useMemo(() => !loading && !saving, [loading, saving]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setSaving(true);
    try {
      const payload = {
        display_name,
        location,
        bio,
        website,
        category,
        subcategory,
        avatar_url: avatarUrl || null,
        tags, // JSON list
        social_links: {
          x: socialLinks.x || "",
          tiktok: socialLinks.tiktok || "",
          instagram: socialLinks.instagram || "",
          facebook: socialLinks.facebook || "",
        },
      };

      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        credentials: "include",
      });

      // Try to parse JSON either way to surface backend errors nicely
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) { router.replace("/login"); return; }
      if (!r.ok) {
        const msg =
          (j && (j.detail || j.error)) ||
          (typeof j === "object" ? JSON.stringify(j) : "Update failed");
        throw new Error(msg);
      }

      if ((j as any)?.avatar_url) setAvatarUrl((j as any).avatar_url);
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
          {/* Avatar URL (backend uses avatar_url string here) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile picture URL</label>
            <input
              value={avatarUrl || ""}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://cdn.example.com/your-avatar.jpg"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
            <div className="mt-2">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || "/user.png"}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Display name</label>
            <input
              value={display_name}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
              placeholder="Your stage or brand name"
              required
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
              value={location || ""}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nairobi, Kenya"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              value={website || ""}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={bio || ""}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about your creative practice…"
              className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            />
          </div>

          {/* Tags */}
          <TagInput value={tags} onChange={setTags} />

          {/* Social handles */}
          <SocialHandles value={socialLinks} onChange={setSocialLinks} />

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
