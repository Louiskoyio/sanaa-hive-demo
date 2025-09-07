// pages/profile.tsx
import { useEffect, useState } from "react";
import Page from "@/components/Page";

type Me = { id: number | string; username: string; email: string; is_creator: boolean };
type Creative = {
  display_name: string;
  location: string;
  bio: string;
  website: string;
  avatar_url: string;
  verified: boolean;
  tags: string[];
  // the rest can be added later: social_links, price range, availability, etc.
};

function Badge({ text }: { text: string }) {
  const t = text.toLowerCase();
  const classes = t.includes("verified") ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700";
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${classes}`}>{text}</span>;
}

export default function MyProfilePage() {
  const [tab, setTab] = useState<"about" | "portfolio" | "events" | "shop">("about");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [creative, setCreative] = useState<Creative | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch("/api/my-profile");
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed to load profile");
        if (!mounted) return;
        setMe(j.me);
        setCreative(j.creative);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stageName = creative?.display_name || me?.username || "Your profile";
  const isVerified = !!creative?.verified;
  const location = creative?.location || "";
  const bio = creative?.bio || "";
  const website = creative?.website || "";
  const avatar = creative?.avatar_url || "/assets/creatives/mint-glint.png"; // fallback
  const tags = creative?.tags || [];

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="-mt-10 md:-mt-12 bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <img src={avatar} alt="avatar" className="w-full h-56 object-cover" />
          </div>

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
                <div className="mt-1 text-gray-700">{/* category not on model; you can add later */}</div>
                <div className="text-sm text-gray-500">{location}</div>
              </>
            )}

            {/* Stats placeholder (hide for now) */}
            {/* <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div><span className="font-semibold text-gray-900">0</span> followers</div>
              <div><span className="font-semibold text-gray-900">0</span> likes</div>
              <div><span className="font-semibold text-gray-900">0</span> sales</div>
            </div> */}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-md bg-royal-purple text-white font-medium hover:bg-royal-purple/90">
              Edit
            </button>
            <button className="px-4 py-2 rounded-md bg-white border border-black/10 hover:bg-gray-50">
              Message
            </button>
            <button className="px-4 py-2 rounded-md bg-sanaa-orange text-white font-medium hover:opacity-90">
              Hire
            </button>
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

          {/* About */}
          {tab === "about" && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900">About</h3>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  {loading ? "Loading…" : (bio || "No bio yet.")}
                </p>

                <h4 className="mt-6 text-sm font-semibold text-gray-900">Tags / Skills</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {loading
                    ? <span className="text-xs text-gray-500">Loading…</span>
                    : tags.length
                      ? tags.map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                            {t}
                          </span>
                        ))
                      : <span className="text-xs text-gray-500">No tags yet.</span>}
                </div>
              </div>

              <aside className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  <li>
                    Email:{" "}
                    {me?.email ? (
                      <a className="underline" href={`mailto:${me.email}`}>{me.email}</a>
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

                {/* Optional sections when you add to model */}
                {/* <h4 className="mt-6 text-sm font-semibold text-gray-900">Availability</h4>
                <p className="mt-1 text-sm text-gray-700">—</p>

                <h4 className="mt-6 text-sm font-semibold text-gray-900">Price Range</h4>
                <p className="mt-1 text-sm text-gray-700">—</p> */}
              </aside>
            </div>
          )}

          {/* Portfolio */}
          {tab === "portfolio" && (
            <div className="mt-6 text-sm text-gray-600">No portfolio items yet.</div>
          )}

          {/* Events */}
          {tab === "events" && (
            <div className="mt-6 text-sm text-gray-600">No upcoming events.</div>
          )}

          {/* Shop */}
          {tab === "shop" && (
            <div className="mt-6 text-sm text-gray-600">No items yet.</div>
          )}
        </div>
      </section>
    </Page>
  );
}
