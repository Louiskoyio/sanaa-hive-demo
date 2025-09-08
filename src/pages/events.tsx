// pages/events.tsx
import { useEffect, useMemo, useState } from "react";
import Page from "@/components/Page";
import EventCard from "@/components/EventCard";

/** --- Backend shape from EventReadSerializer --- */
type EventAPI = {
  id: number | string;
  slug: string;
  title: string;
  description?: string;
  venue?: string;
  start_time?: string;   // ISO
  end_time?: string;     // ISO
  status?: string;       // "Published" | "Pending Approval" | "Rejected" | "Complete"
  total_tickets?: number;
  tags?: string[];
  cover_url?: string;    // may be relative to MEDIA_URL
  organizer_slug?: string;
};

/** --- Card adapter type --- */
type EventItem = {
  slug: string;                 // used by /events/[slug]
  title: string;
  date: string | Date;          // uses start_time (fallback to now)
  venue?: string;
  description: string;
  image: string;
  price?: string;
  ticketUrl?: string;
  badge?: string;               // show status if not Published (optional)
  tags: string[];               // for chips filtering
};

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    // @ts-ignore – unicode property escapes
    .replace(/\p{Diacritic}/gu, "");
}

function toImageSrc(cover_url?: string): string {
  const v = (cover_url || "").trim();
  if (!v) return "/event-placeholder.jpg";
  if (/^(https?:)?\/\//i.test(v) || /^data:/i.test(v)) return v;
  const base = (process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000").replace(/\/+$/, "");
  return `${base}/${v.replace(/^\/+/, "")}`;
}

export default function Events() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<EventItem[]>([]);
  const [tags, setTags] = useState<string[]>(["All"]); // dynamic chips

  // Fetch ALL events from backend (no status/mine filters)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const apiBase = (process.env.NEXT_PUBLIC_DJANGO_API_BASE || "").replace(/\/+$/, "");
        if (!apiBase) throw new Error("Missing NEXT_PUBLIC_DJANGO_API_BASE");

        const r = await fetch(`${apiBase}/api/events/list/all/`, { cache: "no-store" });
        const body = await r.json();
        if (!r.ok) throw new Error(body?.detail || "Failed to load events");

        if (!mounted) return;

        const data: EventAPI[] = Array.isArray(body) ? body : (body.results || []);

        // Map into EventCard-friendly shape (no status filtering)
        const mapped: EventItem[] = (data || []).map((e) => ({
          slug: e.slug,
          title: e.title || "Untitled Event",
          date: e.start_time ?? new Date().toISOString(),  // ensure string|Date
          venue: e.venue,
          description: e.description || "",
          image: toImageSrc(e.cover_url),
          badge: e.status && e.status !== "Published" ? e.status : undefined,
          tags: Array.isArray(e.tags) ? e.tags : [],
        }));

        // Build dynamic tag chips
        const uniqTags = Array.from(
          new Set<string>(mapped.flatMap((m) => m.tags || []).map((t) => t.trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        setItems(mapped);
        setTags(["All", ...uniqTags]);
        if (tag !== "All" && !uniqTags.includes(tag)) setTag("All");
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load events");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []); // initial load only

  // Filter by tag chip + search
  const filtered = useMemo(() => {
    const nq = normalize(q);
    const nt = normalize(tag);

    return items.filter((e) => {
      if (tag !== "All") {
        const has = (e.tags || []).some((t) => normalize(t) === nt);
        if (!has) return false;
      }
      return normalize(e.title).includes(nq);
    });
  }, [q, tag, items]);

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-2xl font-semibold">Events</h3>

          <div className="relative w-full sm:w-auto sm:min-w-[320px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events"
              className="w-full rounded-full bg-white/80 border border-black/10 py-2 pl-10 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-sanaa-orange/60"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tag chips (dynamic) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-3 py-1.5 rounded-full border text-sm transition ${
                tag === t
                  ? "bg-sanaa-orange text-white border-sanaa-orange"
                  : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* States */}
        {err && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2 mb-6">
            {err}
          </div>
        )}
        {loading && <div className="text-gray-600 text-sm py-10">Loading events…</div>}

        {/* Results */}
        {!loading && (
          filtered.length ? (
            <div className="space-y-6">
              {filtered.map((e) => (
                <EventCard
                  key={e.slug}
                  slug={e.slug}               // routes CTA to /events/[slug]
                  title={e.title}
                  date={e.date}               // guaranteed string|Date
                  venue={e.venue || ""}
                  description={e.description}
                  image={e.image}
                  price={e.price}
                  ticketUrl={e.ticketUrl}     // ignored if slug present
                  badge={e.badge}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-sm py-10">No events match “{q}”.</div>
          )
        )}
      </section>
    </Page>
  );
}
