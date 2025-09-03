// lib/data/events.ts
export type Ticket = {
  id: string;
  label: string;          // e.g. "General Admission"
  price: number;          // numeric for totals
  available: number;      // stock
};

export type EventItem = {
  slug: string;           // <-- used by /events/[slug]
  title: string;
  date: string | Date;
  venue: string;
  description: string;
  image: string;
  price?: string;         // optional formatted
  ticketUrl?: string;     // external link fallback (optional)
  onBuy?: () => void;     // client fallback
  badge?: string;
  category?: string;      // used by your chips
  tickets?: Ticket[];     // for the ticket tab
};

export const EVENTS: EventItem[] = [
  {
    slug: "sanaa-talent-search",
    title: "Sanaa Talent Show",
    date: "2025-09-21T16:00:00",
    venue: "Hazina Trade Center, Nairobi",
    description:
      "Live art performance, sound, and pop-up merch featuring emerging creatives.",
    image: "/assets/highlighted-events/highlighted-event-5.png",
    price: "Ksh. 1,000",
    badge: "New",
    category: "Showcase",
    tickets: [
      { id: "ga", label: "General Admission", price: 1000, available: 200 },
      { id: "vip", label: "VIP", price: 2500, available: 50 },
    ],
  },
  {
    slug: "makers-market",
    title: "Maker’s Market",
    date: new Date().toISOString(),
    venue: "The Alchemist, Nairobi",
    description:
      "Discover handmade crafts, prints, and apparel by local artists. Family friendly; food trucks on site.",
    image: "/assets/highlighted-events/highlighted-event-3.jpg",
    price: "Free Entry",
    badge: "Sold Out",
    category: "Market",
    tickets: [{ id: "rsvp", label: "RSVP", price: 0, available: 0 }],
  },
];

export function getEventSlugs() {
  return EVENTS.map((e) => e.slug);
}

export function getEventBySlug(slug: string) {
  return EVENTS.find((e) => e.slug === slug);
}
