// pages/events.tsx
import { useMemo, useState } from "react";
import Page from "@/components/Page";
import EventCard from "@/components/EventCard";


type EventItem = {
  slug: string;                 // NEW: used by /events/[slug]
  title: string;
  date: string | Date;
  venue: string;
  description: string;
  image: string;
  price?: string;
  ticketUrl?: string;
  onBuy?: () => void;
  badge?: string;
  category?: string;            // used by filter chips
};

const eventsData: EventItem[] = [
  {
    slug: "sanaa-talent-search",
    title: "Sanaa Talent Search",
    date: "2025-09-21T16:00:00",
    venue: "Hazina Trade Center, Nairobi",
    description:
      "An evening of art, live sets, and pop-up merch featuring emerging Nairobi creatives. Limited capacity—arrive early!",
    image: "/assets/highlighted-events/highlighted-event-5.png",
    price: "Ksh. 1,000",
    // ticketUrl: "https://tickets.example.com/sundown", // optional; slug takes precedence in EventCard
    badge: "New",
    category: "Showcase",
  },
  {
    slug: "makers-market",
    title: "Maker’s Market",
    date: new Date(),
    venue: "The Alchemist, Nairobi",
    description:
      "Discover handmade crafts, prints, and apparel by local artists. Family friendly; food trucks on site.",
    image: "/assets/highlighted-events/highlighted-event-3.jpg",
    price: "Free Entry",
    // onBuy: () => alert("Handle RSVP / free ticket flow"), // optional; slug takes precedence
    badge: "Sold Out",
    category: "Market",
  },
];

// diacritics-insensitive lowercase
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function Events() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  // Build chip list dynamically from data
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of eventsData) {
      if (e.category) set.add(e.category.split("•")[0].trim());
    }
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    const ncat = normalize(cat);

    return eventsData.filter((e) => {
      if (cat !== "All") {
        const ec = e.category ? normalize(e.category) : "";
        if (!ec.includes(ncat)) return false;
      }
      return normalize(e.title).includes(nq);
    });
  }, [q, cat]);

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-2xl font-semibold">Upcoming Events</h3>

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
              placeholder="Search events"
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

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
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
        <div className="space-y-6">
          {filtered.length ? (
            filtered.map((e) => (
              <EventCard
                key={e.slug}
                slug={e.slug}               // ← pass the slug so CTA routes to /events/[slug]
                title={e.title}
                date={e.date}
                venue={e.venue}
                description={e.description}
                image={e.image}
                price={e.price}
                ticketUrl={e.ticketUrl}
                onBuy={e.onBuy}
                badge={e.badge}
              />
            ))
          ) : (
            <div className="text-gray-600 text-sm py-10">No events match “{q}”.</div>
          )}
        </div>
      </section>
    </Page>
  );
}
