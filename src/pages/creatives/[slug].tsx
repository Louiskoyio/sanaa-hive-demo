// pages/creatives/[slug].tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Page from "@/components/Page";

type Creative = {
  display_name: string;
  category?: string;
  subcategory?: string;
  location?: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
  verified?: boolean;
  tags?: string[];
};

type EventItem = {
  id: number | string;
  slug: string;            // ⬅️ added
  title: string;
  start_time?: string;     // ISO
  venue?: string;
  cover_url?: string;
};

const images_url = (process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000").replace(/\/+$/, "");

// Verified-only badge with icon
function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-0">
      <img
        src="/verified-badge.png"
        alt="Verified"
        className="h-8 w-8"
      />
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-royal-purple text-white">
        Verified
      </span>
    </span>
  );
}

export default function PublicCreativeProfile() {
  const { query, isReady } = useRouter();
  const [tab, setTab] = useState<"about" | "events">("about");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creative, setCreative] = useState<Creative | null>(null);

  // events
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsErr, setEventsErr] = useState<string | null>(null);

  const slug = useMemo(() => String(query.slug || "").trim(), [query.slug]);

  useEffect(() => {
    if (!isReady || !slug) return;
    let mounted = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);
        // creative detail
        const r = await fetch(`/api/creatives/${encodeURIComponent(slug)}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed to load creative");
        if (!mounted) return;
        setCreative(j);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load creative");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // load events in parallel
    (async () => {
      try {
        setEventsErr(null);
        setEventsLoading(true);
        const er = await fetch(`/api/creatives/${encodeURIComponent(slug)}/events`, { cache: "no-store" });
        const ej = await er.json().catch(() => ({}));
        if (!er.ok) {
          setEventsErr(ej?.error || "Failed to load events");
          setEvents([]);
        } else {
          setEvents(Array.isArray(ej) ? ej : Array.isArray(ej?.results) ? ej.results : []);
        }
      } catch (e: any) {
        setEventsErr(e?.message || "Failed to load events");
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [isReady, slug]);

  const stageName = (creative?.display_name || slug || "Profile").trim();
  const isVerified = !!creative?.verified;
  const category = (creative?.category || "").trim();
  const location = (creative?.location || "").trim();
  const bio = (creative?.bio || "").trim();
  const website = (creative?.website || "").trim();

  const avatarSrc = (() => {
    const v = (creative?.avatar_url || "").trim();
    if (!v) return "/user.png";
    if (/^(https?:)?\/\//i.test(v) || /^data:/i.test(v)) return v;
    return `${images_url}/${v.replace(/^\/+/, "")}`;
  })();

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
      return iso || "";
    }
  };

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="-mt-10 md:-mt-12 bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Avatar — rounded rectangle */}
          <div className="relative shrink-0">
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-32 w-52 md:h-40 md:w-56 rounded-xl object-cover bg-gray-100"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src.endsWith("/user.png")) return;
                img.src = "/user.png";
              }}
            />
          </div>

          {/* Identity */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {loading ? "Loading…" : stageName}
              </h1>
              {/* Show verified badge ONLY when verified */}
              {!loading && isVerified && <VerifiedBadge />}
            </div>

            {!loading && (
              <>
                {category && <div className="mt-1 text-gray-700 text-sm">{category}</div>}
                {location && <div className="text-sm text-gray-500">{location}</div>}
              </>
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
                  ) : creative?.tags?.length ? (
                    creative.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-sanaa-orange/70 text-white text-xs"
                      >
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
                    Website:{" "}
                    {website ? (
                      <a className="text-sanaa-orange" href={website} target="_blank" rel="noreferrer">
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

          {/* Events (public) */}
          {tab === "events" && (
            <div className="mt-6">
              {eventsLoading ? (
                <div className="text-sm text-gray-600">Loading events…</div>
              ) : eventsErr ? (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                  {eventsErr}
                </div>
              ) : !events.length ? (
                <div className="text-sm text-gray-600">No events yet.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((ev) => {
                    const img = ev.cover_url
                      ? (/^(https?:)?\/\//i.test(ev.cover_url)
                          ? ev.cover_url
                          : `${images_url}/${ev.cover_url.replace(/^\/+/, "")}`)
                      : "/event-placeholder.jpg";
                    return (
                      <div key={String(ev.id)} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                        <div className="h-40 w-full bg-gray-100">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="text-sm font-semibold text-sanaa-orange">
                            {ev.title || "Untitled event"}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{fmtDate(ev.start_time)}</div>
                          {ev.venue && <div className="text-xs text-gray-500">{ev.venue}</div>}
                        </div>
                        <div className="p-4 pt-0">
                          <Link
                            href={`/events/${encodeURIComponent(ev.slug)}`}
                            className="inline-block w-full text-center px-4 py-2 rounded-md bg-royal-purple text-white font-medium hover:opacity-90"
                          >
                            View Event
                          </Link>
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
    </Page>
  );
}
