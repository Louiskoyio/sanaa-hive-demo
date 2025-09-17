// pages/events/[slug].tsx
import type { GetServerSideProps } from "next";
import Page from "@/components/Page";
import { useEffect, useMemo, useState } from "react";
import QtyStepper from "@/components/QtyStepper"; // ← adjust path if needed

function formatDate(d?: string | Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type TierKey = "regular" | "vip" | "vvip";
type Ticket = { id: TierKey; label: string; price: number; available: number };
type EventItem = {
  slug: string;
  title: string;
  description?: string;
  venue?: string;
  image: string;
  badge?: string;
  date?: string | null;
};

type Props = { event: EventItem };

type PricingRow = {
  regular_price: string; regular_allocation: number;
  vip_price: string;     vip_allocation: number;
  vvip_price: string;    vvip_allocation: number;
};

type Tab = "tickets" | "photos" | "updates";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || API_BASE).replace(/\/+$/, "");

export default function EventProfile({ event }: Props) {
  const [tab, setTab] = useState<Tab>("tickets");

  // fetched ticket data
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [mintedExists, setMintedExists] = useState<boolean>(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // quantity per tier
  const [qtyByTier, setQtyByTier] = useState<Record<TierKey, number>>({
    regular: 1, vip: 1, vvip: 1,
  });

  // selection for modal
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  // buyer form
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone9,    setPhone9]    = useState(""); // 9 digits after +254
  const fullPhone = `+254${phone9}`;

  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = /^\d{9}$/.test(phone9);
  const canSubmit  = Boolean(selected) && phoneValid && emailValid;

  const total = useMemo(() => {
    if (!selected) return 0;
    const q = qtyByTier[selected.id] || 1;
    return selected.price * q;
  }, [selected, qtyByTier]);

  useEffect(() => {
    let alive = true;

    async function getCount(url: string): Promise<number> {
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) return 0;
      const j = await r.json().catch(() => ({} as any));
      if (typeof j?.count === "number") return j.count;
      if (Array.isArray(j)) return j.length;
      if (Array.isArray(j?.results)) return j.results.length;
      return 0;
    }

    (async () => {
      try {
        setLoadingTickets(true);
        setLoadErr(null);

        // 1) any minted tickets?
        const mintedTotal = await getCount(`${API_BASE}/api/tickets/?event=${encodeURIComponent(event.slug)}&page_size=1`);
        if (!alive) return;
        setMintedExists(mintedTotal > 0);

        if (mintedTotal <= 0) {
          setTickets([]);
          return;
        }

        // 2) pricing
        let pricing: PricingRow | null = null;
        try {
          const pr = await fetch(`${API_BASE}/api/ticket-pricing/?event=${encodeURIComponent(event.slug)}`, {
            headers: { Accept: "application/json" },
          });
          if (pr.ok) {
            const j = await pr.json();
            pricing = Array.isArray(j) ? (j[0] || null)
                    : Array.isArray(j?.results) ? (j.results[0] || null)
                    : j || null;
          }
        } catch { /* noop */ }

        // 3) available counts per tier (available=true)
        const [availR, availV, availVV] = await Promise.all([
          getCount(`${API_BASE}/api/tickets/?event=${encodeURIComponent(event.slug)}&tier=regular&available=true&page_size=1`),
          getCount(`${API_BASE}/api/tickets/?event=${encodeURIComponent(event.slug)}&tier=vip&available=true&page_size=1`),
          getCount(`${API_BASE}/api/tickets/?event=${encodeURIComponent(event.slug)}&tier=vvip&available=true&page_size=1`),
        ]);
        if (!alive) return;

        const baseCards = [
          { id: "regular" as const, label: "Regular", price: Number(pricing?.regular_price ?? 0), available: availR },
          { id: "vip"     as const, label: "VIP",     price: Number(pricing?.vip_price     ?? 0), available: availV },
          { id: "vvip"    as const, label: "VVIP",    price: Number(pricing?.vvip_price    ?? 0), available: availVV },
        ];

        const cards: Ticket[] = baseCards.filter(t =>
          (t.price > 0) || t.available > 0 || (
            pricing ? (
              (t.id === "regular" && (pricing.regular_allocation || 0) > 0) ||
              (t.id === "vip"     && (pricing.vip_allocation     || 0) > 0) ||
              (t.id === "vvip"    && (pricing.vvip_allocation    || 0) > 0)
            ) : true
          )
        );

        setTickets(cards);
      } catch (e: any) {
        if (!alive) return;
        setTickets([]);
        setLoadErr(e?.message || "Failed to load tickets.");
      } finally {
        if (alive) setLoadingTickets(false);
      }
    })();

    return () => { alive = false; };
  }, [event.slug]);

  // prevent scroll when modal open
  useEffect(() => {
    if (!showPayModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [showPayModal]);

  function handlePhoneChange(v: string) {
    const onlyDigits = v.replace(/\D/g, "").slice(0, 9);
    setPhone9(onlyDigits);
  }

  function openBuyFor(t: Ticket) {
    if (t.available <= 0) return;
    setSelected(t);
    setShowPayModal(true);
  }
  function closePayModal() {
    setShowPayModal(false);
  }
  function handleConfirmPay(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !selected) return;
    const payload = {
      event: event.title,
      ticket: selected.label,
      qty: qtyByTier[selected.id] || 1,
      total,
      buyer: {
        firstName: firstName || undefined,
        lastName:  lastName  || undefined,
        email:     email     || undefined,
        phone:     fullPhone,
      },
    };
    console.log("Submitting payment:", payload);
    alert(`Mock payment\n${JSON.stringify(payload, null, 2)}`);
    setShowPayModal(false);
  }

  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="-mt-10 md:-mt-12 bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="shrink-0 md:w-[360px]">
            <img src={event.image} alt={event.title} className="w-full h-56 object-cover rounded-lg" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{event.title}</h1>
              {event.badge && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white">
                  {event.badge}
                </span>
              )}
            </div>
            {event.description && <p className="mt-2 text-gray-700">{event.description}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
              {event.date && (
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M7 3v3M17 3v3M3 8h18M5 21h14a2 2 0 0 0 2-2V8H3v11a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>{formatDate(event.date)}</span>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span>{event.venue}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="flex items-center gap-3 border-b border-black/10">
            {[
              { id: "tickets", label: "Tickets" },
              { id: "photos",  label: "Photos"  },
              { id: "updates", label: "Updates" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`px-3 py-2 text-sm font-semibold transition border-b-2 ${
                  tab === (t.id as Tab)
                    ? "border-sanaa-orange text-sanaa-orange"
                    : "border-transparent text-gray-600 hover:text-sanaa-orange"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tickets tab */}
          {tab === "tickets" && (
            <div className="mt-6">
              {loadingTickets ? (
                <div className="text-sm text-gray-600">Loading tickets…</div>
              ) : loadErr ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">
                  {loadErr}
                </div>
              ) : !mintedExists ? (
                <div className="rounded-lg border p-6 text-center text-gray-700">
                  Sorry, tickets not out yet.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tickets.map((t) => {
                    const qty = qtyByTier[t.id] || 1;
                    const soldOut = t.available <= 0;
                    return (
                      <div key={t.id} className="rounded-xl border bg-royal-purple shadow p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-white font-semibold">{t.label}</div>
                          <div className="text-sm">
                            {t.price === 0 ? "Free" : `KES ${t.price.toLocaleString()}`}
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-white">
                          {soldOut ? "Sold out" : `${t.available} left`}
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-medium text-white mb-1">Quantity</label>
                          <QtyStepper
                            value={qty}
                            min={1}
                            max={Math.max(1, t.available)} // prevent exceeding availability
                            onChange={(n) =>
                              setQtyByTier((prev) => ({ ...prev, [t.id]: n }))
                            }
                          />
                        </div>

                        <button
                          disabled={soldOut}
                          onClick={() => openBuyFor(t)}
                          className={`mt-4 w-full rounded-md px-4 py-2 font-medium transition ${
                            soldOut
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-sanaa-orange text-white hover:opacity-90"
                          }`}
                        >
                          {soldOut ? "Sold Out" : "Buy"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "photos" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((x) => (
                <div key={x} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-56 object-cover" />
                </div>
              ))}
            </div>
          )}

          {tab === "updates" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-sm text-gray-600">No updates yet.</div>
            </div>
          )}
        </div>
      </section>

      {/* Payment Modal */}
      {showPayModal && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={closePayModal} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>
              <button onClick={closePayModal} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="px-5 py-4">
              <div className="rounded-md bg-sanaa-orange border border-black/10 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Event</span>
                  <span className="font-medium text-white">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Ticket</span>
                  <span className="font-medium text-white">{selected.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Quantity</span>
                  <span className="font-medium text-white">{qtyByTier[selected.id] || 1}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-white font-semibold">Total</span>
                  <span className="font-bold text-white">
                    {total === 0 ? "Free" : `KES ${total.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name (optional)</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
                    placeholder="Asha"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name (optional)</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
                    placeholder="Kamau"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                    emailValid ? "border-black/10 focus:ring-royal-purple/60" : "border-rose-400 focus:ring-rose-300"
                  }`}
                  placeholder="asha@example.com"
                />
                {!emailValid && <p className="mt-1 text-xs text-rose-600">Please enter a valid email address.</p>}
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">M-Pesa Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-black/10 bg-gray-50 text-gray-700 select-none">
                    +254
                  </span>
                  <input
                    inputMode="numeric"
                    pattern="\d{9}"
                    maxLength={9}
                    value={phone9}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="7XXXXXXXX"
                    className={`flex-1 rounded-r-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      phoneValid ? "border-black/10 focus:ring-royal-purple/60" : "border-rose-400 focus:ring-rose-300"
                    }`}
                    aria-describedby="phoneHelp"
                  />
                </div>
                <p id="phoneHelp" className="mt-1 text-xs text-gray-500">
                  Enter the last 9 digits only (e.g., 712345678). We’ll send the STK push to {fullPhone}.
                </p>
                {!phoneValid && phone9.length > 0 && (
                  <p className="mt-1 text-xs text-rose-600">Phone must be exactly 9 digits.</p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closePayModal}
                  className="px-4 py-2 rounded-md bg-sanaa-orange text-white border border-black/10 hover:bg-white hover:text-sanaa-orange"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    canSubmit ? "bg-royal-purple text-white hover:bg-royal-purple/90" : "bg-verylight-purple text-white cursor-not-allowed"
                  }`}
                >
                  {total === 0 ? "Confirm RSVP" : "Confirm & Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
}

// ---- SSR: fetch event by slug from Django ----
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || API_BASE).replace(/\/+$/, "");

  try {
    const resp = await fetch(`${API_BASE}/api/events/${encodeURIComponent(slug)}/`, {
      headers: { Accept: "application/json" },
    });
    if (resp.status === 404) return { notFound: true };
    const data = await resp.json();

    const cover = data.poster || data.cover_url || null;
    const image =
      cover
        ? (/^(https?:)?\/\//i.test(cover) ? cover : `${MEDIA_BASE}/${String(cover).replace(/^\/+/, "")}`)
        : "/event-placeholder.jpg";

    return {
      props: {
        event: {
          slug: data.slug,
          title: data.title || "Untitled event",
          description: data.description || "",
          venue: data.venue || "",
          image,
          badge: data.status,
          date: data.start_time || data.start_at || null,
        } as EventItem,
      },
    };
  } catch {
    return { notFound: true };
  }
};
