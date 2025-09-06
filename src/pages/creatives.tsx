// pages/creatives.tsx
import { useMemo, useState } from "react";
import Page from "@/components/Page";
import CreativeCard from "@/components/CreativeCard";

type CreativeItem = {
  stageName: string;
  category: string;
  verified?: boolean;
  profileUrl?: string;
  onView?: () => void;
  image: string;
};

const creativesData: CreativeItem[] = [
  {
    stageName: "Mint Glint Studios",
    category: "Studio",
    verified: true,
    profileUrl: "/creatives/mint-glint-studios",
    image: "/assets/creatives/mint-glint.png",
  },
  {
    stageName: "Kito Wave",
    category: "DJ • Afro House",
    verified: false,
    profileUrl: "/creatives/kito-wave",
    image: "/assets/creatives/kito-wave.jpg",
  },
  {
    stageName: "Mara Collective",
    category: "Photography",
    verified: true,
    profileUrl: "/creatives/mara-collective",
    image: "/assets/creatives/mara-collective.jpg",
  },
  {
    stageName: "Nairobi Threads",
    category: "Fashion • Streetwear",
    verified: false,
    profileUrl: "/creatives/nairobi-threads",
    image: "/assets/creatives/nairobi-threads.webp",
  },
];

// category chips (add more as you grow)
const CATEGORIES = ["All", "Studio", "DJ", "Photography", "Fashion"] as const;
type Cat = typeof CATEGORIES[number];

// diacritics-insensitive lowercase
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function Creatives() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat>("All");

  const filtered = useMemo(() => {
    const nq = normalize(q);
    const ncat = normalize(cat);

    return creativesData.filter((c) => {
      // category filter: "All" passes; otherwise match contains (so "DJ" matches "DJ • Afro House")
      if (cat !== "All" && !normalize(c.category).includes(ncat)) return false;

      // name search (keep like your Events page)
      return normalize(c.stageName).includes(nq);
    });
  }, [q, cat]);

  return (
    <Page >
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-2xl font-semibold">Creatives</h3>

          <div className="relative w-full sm:w-auto sm:min-w-[320px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {/* search icon */}
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
                {/* X icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category chips (same style as Feed) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
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

        {/* Results */}
        {filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div key={c.stageName} className="h-full">
                <CreativeCard
                  stageName={c.stageName}
                  category={c.category}
                  verified={c.verified}
                  profileUrl={c.profileUrl}
                  onView={c.onView}
                  image={c.image}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600 text-sm py-10">No creatives match “{q}”.</div>
        )}
      </section>
    </Page>
  );
}
