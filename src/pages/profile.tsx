// pages/profile.tsx
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Page from "@/components/Page";

/* ----------------------------- Types ----------------------------- */
type Me = { id: number | string; username: string; email: string; is_creator: boolean };

type Creative = {
  display_name: string;
  category?: string;
  subcategory?: string;
  location: string;
  bio: string;
  website: string;
  avatar_url: string;
  verified: boolean;
  tags: string[];
};

type EventItem = {
  id: number | string;
  title: string;
  start_time?: string; // ISO
  venue?: string;
  cover_url?: string;
};

const images_url = (process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000").replace(/\/+$/, "");
const AVATAR_UPLOAD_URL = "/api/profile/avatar/"; // dedicated avatar endpoint

/* ----------------------------- UI Bits ----------------------------- */
function Badge({ text }: { text: string }) {
  const t = text.toLowerCase();
  const classes = t.includes("verified")
    ? "bg-emerald-500 text-white"
    : "bg-gray-200 text-gray-700";
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${classes}`}>{text}</span>;
}

/* ----------------------------- Page ----------------------------- */
export default function MyProfilePage() {
  const router = useRouter();

  const [tab, setTab] = useState<"about" | "events">("about");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [me, setMe] = useState<Me | null>(null);
  const [creative, setCreative] = useState<Creative | null>(null);

  // avatar modal state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarLocalPreview, setAvatarLocalPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsErr, setEventsErr] = useState<string | null>(null);

  /* ------------------------ Auth + Profile Load ------------------------ */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        // 1) auth check
        const meR = await fetch("/api/me", { cache: "no-store" });
        const meJ = await meR.json().catch(() => ({}));
        const authenticated = meR.ok && (meJ?.authenticated ?? false);
        if (!authenticated) {
          router.replace(`/login?next=/profile`);
          return;
        }
        if (!mounted) return;
        setMe(meJ.user);

        // 2) load creative profile
        const r = await fetch("/api/me/profile", { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Failed to load profile");
        if (!mounted) return;
        setCreative(j);

        // 3) prefetch events
        setEventsLoading(true);
        const er = await fetch("/api/me/events", { cache: "no-store" });
        const ej = await er.json().catch(() => ({}));
        if (!er.ok) {
          setEventsErr(ej?.error || "Failed to load events");
          setEvents([]);
        } else {
          setEvents(Array.isArray(ej) ? ej : Array.isArray(ej?.results) ? ej.results : []);
        }
      } catch (e: any) {
        if (!mounted) return;
        const msg = e?.message || "Failed to load profile";
        if (/not authenticated/i.test(msg) || /unauthorized|401/i.test(msg)) {
          router.replace(`/login?next=/profile`);
          return;
        }
        setErr(msg);
      } finally {
        if (mounted) {
          setLoading(false);
          setEventsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  /* ------------------------ Derived Display ------------------------ */
  const stageName = (creative?.display_name || me?.username || "Your profile").trim();
  const isVerified = !!creative?.verified;
  const category = (creative?.category || "").trim();
  const location = (creative?.location || "").trim();
  const bio = (creative?.bio || "").trim();
  const website = (creative?.website || "").trim();
  const avatar_url = (creative?.avatar_url && creative.avatar_url.trim()) || "/user.png";
  const tags = creative?.tags || [];

  const avatarSrc = useMemo(() => {
    const v = (avatar_url || "").trim();
    if (!v) return "/user.png";
    if (/^(https?:)?\/\//i.test(v) || /^data:/i.test(v)) return v;
    return `${images_url}/${v.replace(/^\/+/, "")}`;
  }, [avatar_url]);

  /* ------------------------ Avatar Handlers ------------------------ */
  function openAvatarModal() {
    setShowAvatarModal(true);
    setAvatarLocalPreview(null);
    setAvatarFile(null);
  }
  function closeAvatarModal() {
    if (avatarLocalPreview) URL.revokeObjectURL(avatarLocalPreview);
    setAvatarLocalPreview(null);
    setAvatarFile(null);
    setShowAvatarModal(false);
  }
  async function uploadAvatar() {
    if (!avatarFile) return;
    try {
      setUploadingAvatar(true);
      const fd = new FormData();
      fd.append("avatar", avatarFile, avatarFile.name);
      const r = await fetch(AVATAR_UPLOAD_URL, {
        method: "PATCH",
        body: fd,
        cache: "no-store",
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || j?.error || "Failed to upload avatar");

      const newUrl: string | undefined = j?.avatar_url || j?.data?.avatar_url || j?.avatar;
      if (newUrl) {
        setCreative((prev) => (prev ? { ...prev, avatar_url: newUrl } : prev));
      } else {
        // fallback: refetch profile to get fresh URL
        try {
          const pr = await fetch("/api/me/profile", { cache: "no-store" });
          const pj = await pr.json();
          if (pr.ok && pj?.avatar_url) {
            setCreative((prev) => (prev ? { ...prev, avatar_url: pj.avatar_url } : prev));
          }
        } catch {}
      }
      closeAvatarModal();
    } catch (e: any) {
      alert(e?.message || "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  /* ------------------------ Event Render Helpers ------------------------ */
  const fmtDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  /* ------------------------ Render ------------------------ */
  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="-mt-10 md:-mt-12 bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Avatar (fixed size, cropped, clickable) */}
          <button
            type="button"
            onClick={openAvatarModal}
            className="relative shrink-0 group rounded-full focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
            title="Change profile picture"
          >
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover bg-gray-100"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src.endsWith("/user.png")) return;
                img.src = "/user.png";
              }}
            />
            <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition grid place-items-center text-white text-xs font-medium opacity-0 group-hover:opacity-100">
              Change
            </span>
          </button>

          {/* Identity */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {loading ? "Loading…" : stageName}
              </h1>
              {!loading && <Badge text={isVerified ? "Verified" : "Not Verified"} />}
            </div>

            {!loading && (
              <>
                {category && <div className="mt-1 text-gray-700 text-sm">{category}</div>}
                {location && <div className="text-sm text-gray-500">{location}</div>}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/profile/edit"
              className="px-4 py-2 rounded-md bg-royal-purple text-white font-medium hover:bg-royal-purple/90"
            >
              Edit Profile
            </Link>
            {me?.is_creator ? (
              <Link
                href="/create-event"
                className="px-4 py-2 rounded-md bg-royal-purple text-white font-medium hover:opacity-90"
              >
                Create Event
              </Link>
            ) : (
              <span
                title="Only creators can create events"
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-600 font-medium cursor-not-allowed"
              >
                Create Event
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <div className="flex items-center gap-3 border-b border-black/10">
            {[
              { id: "about", label: "About" },
              { id: "events", label: "Events" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-3 py-2 text-sm font-semibold transition border-b-2 ${
                  tab === t.id
                    ? "border-sanaa-orange text-sanaa-orange"
                    : "border-transparent text-gray-600 hover:text-sanaa-orange"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* About */}
          {tab === "about" && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900">About</h3>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  {loading ? "Loading…" : bio || "No bio yet."}
                </p>

                <h4 className="mt-6 text-sm font-semibold text-gray-900">Tags / Skills</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {loading ? (
                    <span className="text-xs text-gray-500">Loading…</span>
                  ) : tags.length ? (
                    tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No tags yet.</span>
                  )}
                </div>
              </div>

              <aside className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  <li>
                    Email:{" "}
                    {me?.email ? (
                      <a className="underline" href={`mailto:${me.email}`}>
                        {me.email}
                      </a>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </li>
                  <li>
                    Website:{" "}
                    {website ? (
                      <a className="underline" href={website} target="_blank" rel="noreferrer">
                        {website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </li>
                </ul>
              </aside>
            </div>
          )}

          {/* Events */}
          {tab === "events" && (
            <div className="mt-6">
              {eventsLoading ? (
                <div className="text-sm text-gray-600">Loading your events…</div>
              ) : eventsErr ? (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                  {eventsErr}
                </div>
              ) : !events.length ? (
                <div className="text-sm text-gray-600">You haven’t created any events yet.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((ev) => {
                    const img = ev.cover_url
                      ? (/^(https?:)?\/\//i.test(ev.cover_url)
                          ? ev.cover_url
                          : `${images_url}/${ev.cover_url.replace(/^\/+/, "")}`)
                      : "/event-placeholder.jpg";
                    return (
                      <div key={String(ev.id)} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="h-40 w-full bg-gray-100">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-semibold text-gray-900">{ev.title || "Untitled event"}</div>
                          <div className="text-xs text-gray-600 mt-1">{fmtDate(ev.start_time)}</div>
                          {ev.venue && <div className="text-xs text-gray-500">{ev.venue}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={closeAvatarModal} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Change profile picture</h3>

              <div className="flex items-center justify-center">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={avatarLocalPreview || avatarSrc}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-black/10 bg-white hover:bg-gray-50 cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm font-medium">Choose image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setAvatarFile(f);
                      if (avatarLocalPreview) URL.revokeObjectURL(avatarLocalPreview);
                      setAvatarLocalPreview(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={closeAvatarModal}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!avatarFile || uploadingAvatar}
                  onClick={uploadAvatar}
                  className={`px-5 py-2 rounded-full bg-royal-purple text-white font-semibold ${
                    avatarFile && !uploadingAvatar ? "hover:bg-royal-purple/90" : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  {uploadingAvatar ? "Saving…" : "Save photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
