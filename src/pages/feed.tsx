// pages/feed.tsx
import { useMemo, useState } from "react";
import Page from "@/components/Page";
import PostCard from "@/components/PostCard";

type Post = {
  id: string;
  authorName: string;
  authorSlug?: string;
  verified?: boolean;
  avatar?: string;
  category?: "Art" | "Music" | "Fashion" | "Photography" | "Other";
  postedAt: string;
  content: string;
  image?: string;
  tags?: string[];
  likes?: number;
  comments?: number;
  initiallyLiked?: boolean;
};

const POSTS: Post[] = [
  {
    id: "p1",
    authorName: "Asha K.",
    authorSlug: "asha-k",
    verified: true,
    category: "Art",
    postedAt: "2025-08-28T14:20:00",
    content:
      "New series inspired by Nairobi dusk—playing with acrylics and metallic leaf. What do you think of these tones?",
    image: "/assets/portfolio/p1.jpg",
    tags: ["Acrylic", "Abstract", "Series"],
    likes: 128,
    comments: 14,
  },
  {
    id: "p2",
    authorName: "Kito Wave",
    authorSlug: "kito-wave",
    verified: false,
    category: "Music",
    postedAt: "2025-08-30T21:10:00",
    content: "Quick clip from last night’s Afro House set—crowd energy was unreal!",
    image: "/assets/events/market.jpg",
    tags: ["AfroHouse", "LiveSet"],
    likes: 92,
    comments: 18,
    initiallyLiked: true,
  },
  {
    id: "p3",
    authorName: "Mara Collective",
    authorSlug: "mara-collective",
    verified: true,
    category: "Photography",
    postedAt: "2025-09-01T10:00:00",
    content:
      "Street portraits of artisans around Kariokor. Pure craft. Full photo essay dropping soon.",
    image: "/assets/portfolio/p3.jpg",
    tags: ["Street", "Portrait", "Documentary"],
    likes: 64,
    comments: 7,
  },
  {
    id: "p4",
    authorName: "Nairobi Threads",
    authorSlug: "nairobi-threads",
    verified: false,
    category: "Fashion",
    postedAt: "2025-08-27T08:00:00",
    content:
      "Teasing looks from the new streetwear capsule. Shot on 35mm. Which fit are you rocking?",
    image: "/assets/portfolio/p4.jpg",
    tags: ["Streetwear", "35mm", "Capsule"],
    likes: 41,
    comments: 5,
  },
];

const CATEGORIES = ["All", "Art", "Music", "Fashion", "Photography"] as const;
type Cat = typeof CATEGORIES[number];

// simple case/diacritics-insensitive normalization
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function Feed() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat>("All");

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return POSTS.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      const hay = [
        p.authorName,
        p.content,
        ...(p.tags || []),
        p.category || "",
      ].join(" ");
      return normalize(hay).includes(nq);
    });
  }, [q, cat]);

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Feed</h1>

          {/* Search */}
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
              placeholder="Search posts, creators, tags…"
              className="w-full rounded-full bg-white/80 border border-black/10 py-2 pl-10 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
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

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full border text-sm transition ${
                cat === c
                  ? "bg-royal-purple text-white border-royal-purple"
                  : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Composer preview (MVP placeholder) */}
        {/*<div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-purple to-royal-purple-700 flex items-center justify-center text-white font-semibold">
              SH
            </div>
            <div className="flex-1">
              <input
                disabled
                placeholder="Share something with your followers…"
                className="w-full rounded-md border border-black/10 bg-gray-50 px-3 py-2 text-gray-500"
              />
              <div className="mt-3 flex items-center gap-2">
                <button disabled className="px-3 py-1.5 rounded-md bg-royal-purple/30 text-white/80 cursor-not-allowed">
                  Post (coming soon)
                </button>
                <button disabled className="px-3 py-1.5 rounded-md bg-white border border-black/10 text-gray-500 cursor-not-allowed">
                  Add image
                </button>
              </div>
            </div>
          </div>
        </div>*/}

        {/* Feed grid */}
        {filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((p) => (
              <PostCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="text-gray-600 text-sm py-10">No posts found.</div>
        )}
      </section>
    </Page>
  );
}
