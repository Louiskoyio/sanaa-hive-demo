// pages/creatives.tsx
import { useEffect, useMemo, useState } from "react";
import Page from "@/components/Page";
import CreativeCard from "@/components/CreativeCard";

// ---- Backend shape (now includes slug)
type CreativeAPI = {
  slug: string;               // 👈 required to build /creatives/[slug]
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

// ---- Card adapter type
type CreativeItem = {
  stageName: string;
  categoryDisplay: string; // "Category • Subcategory"
  topCategory: string;     // category only (for filtering chips)
  verified?: boolean;
  profileUrl?: string;     // /creatives/[slug]
  image: string;
};

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    // @ts-ignore - unicode property escapes
    .replace(/\p{Diacritic}/gu, "");
}

function toImageSrc(avatar_url?: string): string {
  const v = (avatar_url || "").trim();
  if (!v) return "/user.png";
  if (/^(https?:)?\/\//i.test(v) || /^data:/i.test(v)) return v;
  const base = (process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000").replace(/\/+$/, "");
  return `${base}/${v.replace(/^\/+/, "")}`;
}

export default function Creatives() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<CreativeItem[]>([]);
  const [cats, setCats] = useState<string[]>(["All"]); // dynamic chips

  // Fetch creatives from backend
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const apiBase = (process.env.NEXT_PUBLIC_DJANGO_API_BASE || "").replace(/\/+$/, "");
        if (!apiBase) throw new Error("Missing NEXT_PUBLIC_DJANGO_API_BASE");

        const r = await fetch(`${apiBase}/api/creatives/`, { cache: "no-store" });
        const body = await r.json();
        if (!r.ok) throw new Error(body?.detail || "Failed to load creatives");

        if (!mounted) return;

        // Handle both paginated and plain list responses
        const data: CreativeAPI[] = Array.isArray(body) ? body : (body.results || []);

        const mapped: CreativeItem[] = (data || []).map((c) => {
          const main = (c.category || "").trim();
          const sub = (c.subcategory || "").trim();
          const display = [main, sub].filter(Boolean).join(" • ");
          return {
            stageName: c.display_name || "Untitled",
            categoryDisplay: display || (main || "—"),
            topCategory: main || "Other",
            verified: !!c.verified,
            profileUrl: c.slug ? `/creatives/${encodeURIComponent(c.slug)}` : undefined, // 👈 slug link
            image: toImageSrc(c.avatar_url),
          };
        });

        // Build dynamic category chips
        const uniq = Array.from(
          new Set(
            mapped.map((m) => (m.topCategory || "Other").trim()).filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setItems(mapped);
        setCats(["All", ...uniq]);
        if (cat !== "All" && !uniq.includes(cat)) setCat("All");
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load creatives");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []); // initial load only

  // Filter by chip + search
  const filtered = useMemo(() => {
    const nq = normalize(q);
    const ncat = normalize(cat);

    return items.filter((c) => {
      if (cat !== "All" && normalize(c.topCategory) !== ncat) return false;
      return normalize(c.stageName).includes(nq);
    });
  }, [q, cat, items]);

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-2xl font-semibold">Creatives</h3>

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
              placeholder="Search creatives"
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

        {/* Dynamic Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full border text-sm transition ${
                cat === c
                  ? "bg-sanaa-orange text-white border-sanaa-orange"
                  : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* States */}
        {err && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2 mb-6">
            {err}
          </div>
        )}
        {loading && <div className="text-gray-600 text-sm py-10">Loading creatives…</div>}

        {/* Results */}
        {!loading && (
          filtered.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((c, i) => (
                <div key={`${c.stageName}-${i}`} className="h-full">
                  <CreativeCard
                    stageName={c.stageName}
                    category={c.categoryDisplay}
                    verified={c.verified}
                    profileUrl={c.profileUrl}   // 👈 links to /creatives/[slug]
                    image={c.image}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-sm py-10">No creatives match “{q}”.</div>
          )
        )}
      </section>
    </Page>
  );
}
