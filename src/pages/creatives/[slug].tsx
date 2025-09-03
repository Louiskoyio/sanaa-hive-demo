// pages/creatives/[slug].tsx
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Page from "@/components/Page";
import ProductCard from "@/components/ProductCard";
import EventCard from "@/components/EventCard";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function Badge({ text }: { text: string }) {
  const t = text.toLowerCase();
  const classes =
    t.includes("verified")
      ? "bg-emerald-500 text-white"
      : "bg-gray-200 text-gray-700";
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${classes}`}>
      {text}
    </span>
  );
}

export default function CreativeProfile() {
  const { query } = useRouter();
  const slug = String(query.slug || "asha-k");

  // --- Mock profile data (swap with real data later) ---
  const profile = useMemo(
    () => ({
      stageName: "Mint Glint Studios",
      category: "Studio",
      verified: true,
      location: "Nairobi, Kenya",
      bio:
        "Abstract painter exploring color, memory, and motion. Available for commissions, brand collabs, and exhibitions.",
      socials: [
        { label: "Instagram", href: "#", icon: "insta" },
        { label: "TikTok", href: "#", icon: "tiktok" },
        { label: "Dribbble", href: "#", icon: "dribbble" },
      ],
      stats: { followers: 12_400, likes: 58_200, sales: 132 },
      portfolio: [
        "/assets/portfolio/p1.jpg",
        "/assets/portfolio/p2.jpg",
        "/assets/portfolio/p3.jpg",
        "/assets/portfolio/p4.jpg",
        "/assets/portfolio/p5.jpg",
        "/assets/portfolio/p6.jpg",
      ],
      events: [
        {
          title: "Sanaa Talent Search",
          date: "2025-09-21T16:00:00",
          venue: "Hazina Trade Center, Nairobi",
          description:
            "Live art performance, sound, and pop-up merch from emerging creatives.",
          image: "/assets/highlighted-events/highlighted-event-5.png",
          price: "Ksh. 1,000",
          ticketUrl: "#",
          badge: "New",
        },
      ],
      merch: [
        { title: "Abstract Canvas", price: "Ksh. 120", image: "/assets/merch/1.jpg" },
        { title: "Limited Print", price: "Ksh. 40", image: "/assets/merch/1.webp" },
        { title: "Handmade Tote", price: "Ksh. 30", image: "/assets/merch/4.jpg" },
      ],
    }),
    [slug]
  );

  const [tab, setTab] = useState<"about" | "portfolio" | "events" | "shop">("about");

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="-mt-10 md:-mt-12 bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <img src="/assets/creatives/mint-glint.png" alt={`avatar`} className="w-full h-56 object-cover" />
          </div>

          {/* Identity */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {profile.stageName}
              </h1>
              <Badge text={profile.verified ? "Verified" : "Not Verified"} />
            </div>
            <div className="mt-1 text-gray-700">{profile.category}</div>
            <div className="text-sm text-gray-500">{profile.location}</div>

            {/* Stats */}
            <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div><span className="font-semibold text-gray-900">{profile.stats.followers.toLocaleString()}</span> followers</div>
              <div><span className="font-semibold text-gray-900">{profile.stats.likes.toLocaleString()}</span> likes</div>
              <div><span className="font-semibold text-gray-900">{profile.stats.sales.toLocaleString()}</span> sales</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-md bg-royal-purple text-white font-medium hover:bg-royal-purple/90">
              Follow
            </button>
            <button className="px-4 py-2 rounded-md bg-white border border-black/10 hover:bg-gray-50">
              Message
            </button>
            <button className="px-4 py-2 rounded-md bg-sanaa-orange text-white font-medium hover:opacity-90">
              Hire
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="flex items-center gap-3 border-b border-black/10">
            {[
            { id: "about", label: "About" },
              { id: "portfolio", label: "Portfolio" },
              { id: "events", label: "Events" },
              { id: "shop", label: "Shop" },
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

          {/* Tab panels */}
          {/* Portfolio */}
          {tab === "portfolio" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile.portfolio.map((src, i) => (
                <div key={src} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={src} alt={`Portfolio ${i + 1}`} className="w-full h-56 object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* About */}
          {tab === "about" && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900">About</h3>
                <p className="mt-2 text-gray-700 leading-relaxed">{profile.bio}</p>

                <h4 className="mt-6 text-sm font-semibold text-gray-900">Tags / Skills</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Abstract", "Acrylic", "Murals", "Commission", "Brand Collab"].map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <aside className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  <li>Email: <a className="underline" href="#">asha@example.com</a></li>
                  <li>Website: <a className="underline" href="#">ashak.art</a></li>
                </ul>

                <h4 className="mt-6 text-sm font-semibold text-gray-900">Socials</h4>
                <div className="mt-2 flex items-center gap-3 text-gray-700">
                  {profile.socials.map((s) => (
                    <a key={s.label} href={s.href} className="px-2 py-1 rounded border hover:bg-gray-50 text-sm">
                      {s.label}
                    </a>
                  ))}
                </div>

                <h4 className="mt-6 text-sm font-semibold text-gray-900">Availability</h4>
                <p className="mt-1 text-sm text-gray-700">Open for commissions from Oct 2025</p>

                <h4 className="mt-6 text-sm font-semibold text-gray-900">Price Range</h4>
                <p className="mt-1 text-sm text-gray-700">Ksh. 20,000 – 250,000</p>
              </aside>
            </div>
          )}

          {/* Events */}
          {tab === "events" && (
            <div className="mt-6 space-y-6">
              {profile.events.map((e) => (
                <EventCard key={e.title} {...e} />
              ))}
              {!profile.events.length && (
                <div className="text-sm text-gray-600">No upcoming events.</div>
              )}
            </div>
          )}

          {/* Shop */}
          {tab === "shop" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {profile.merch.map((p) => (
                <ProductCard key={p.title} {...p} />
              ))}
              {!profile.merch.length && (
                <div className="text-sm text-gray-600">No items yet.</div>
              )}
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}
