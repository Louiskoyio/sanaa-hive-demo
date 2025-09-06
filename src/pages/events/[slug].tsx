// pages/events/[slug].tsx
import { GetStaticPaths, GetStaticProps } from "next";
import Page from "@/components/Page";
import { EVENTS, getEventBySlug, getEventSlugs, type EventItem } from "@/lib/data/events";
import { useEffect, useMemo, useState } from "react";

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

type Props = { event: EventItem };

type Tab = "tickets" | "photos" | "updates";

export default function EventProfile({ event }: Props) {
  // ---- Tabs ----
  const [tab, setTab] = useState<Tab>("tickets");

  // ---- Tickets state ----
  const tickets = event.tickets || [];
  const [selected, setSelected] = useState<string | null>(tickets[0]?.id ?? null);
  const [qty, setQty] = useState(1);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selected) || null,
    [tickets, selected]
  );
  const total = selectedTicket ? selectedTicket.price * qty : 0;

  // ---- Payment modal state ----
  const [showPayModal, setShowPayModal] = useState(false);

  // Buyer form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone9, setPhone9]       = useState(""); // 9 digits after +254
  const fullPhone = `+254${phone9}`;

  // basic validations
  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = /^\d{9}$/.test(phone9); // exactly 9 digits
  const canSubmit  = Boolean(selectedTicket) && phoneValid && emailValid;

  // prevent body scroll when modal open
  useEffect(() => {
    if (showPayModal) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [showPayModal]);

  function openPayModal() {
    if (!selectedTicket || selectedTicket.available <= 0) return;
    setShowPayModal(true);
  }

  function closePayModal() {
    setShowPayModal(false);
  }

  function handlePhoneChange(v: string) {
    // only allow digits, max length 9
    const onlyDigits = v.replace(/\D/g, "").slice(0, 9);
    setPhone9(onlyDigits);
  }

  function handleConfirmPay(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // MOCK submit — replace with your API call (e.g., create checkout session + M-Pesa STK push)
    const payload = {
      event: event.title,
      ticket: selectedTicket?.label,
      qty,
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
            <p className="mt-2 text-gray-700">{event.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M7 3v3M17 3v3M3 8h18M5 21h14a2 2 0 0 0 2-2V8H3v11a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs (Tickets + Photos + Shop) */}
        <div className="mt-6">
          <div className="flex items-center gap-3 border-b border-black/10">
            {[
              { id: "tickets", label: "Tickets" },
              { id: "photos",  label: "Photos"  },
              { id: "updates",    label: "Updates"    },
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

          {/* Tab panels */}
          {tab === "tickets" && (
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {/* Left: selector */}
              <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Choose your tickets</h3>

                {tickets.length ? (
                  <>
                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                      {tickets.map((t) => {
                        const soldOut = t.available <= 0;
                        const active = selected === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => !soldOut && setSelected(t.id)}
                            className={`w-full text-left px-4 py-3 rounded-md border transition ${
                              soldOut
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : active
                                  ? "bg-royal-purple text-white border-royal-purple"
                                  : "bg-white text-gray-800 border-black/10 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{t.label}</span>
                              <span className="text-sm">
                                {t.price === 0 ? "Free" : `Ksh. ${t.price.toLocaleString()}`}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              {t.available > 0 ? `${t.available} left` : "Sold out"}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <label className="text-sm text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 rounded-md border border-black/10 px-3 py-2"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 mt-2">Tickets info coming soon.</p>
                )}
              </div>

              {/* Right: summary */}
              <aside className="bg-white rounded-lg shadow p-6 h-fit">
                <h4 className="text-sm font-semibold text-gray-900">Order Summary</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Event</span>
                    <span className="font-medium text-gray-900">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticket</span>
                    <span className="font-medium text-gray-900">{selectedTicket ? selectedTicket.label : "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qty</span>
                    <span className="font-medium text-gray-900">{qty}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Total</span>
                    <span className="font-bold text-gray-900">
                      {selectedTicket ? (total === 0 ? "Free" : `Ksh. ${total.toLocaleString()}`) : "--"}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!selectedTicket || (selectedTicket && selectedTicket.available <= 0)}
                  className={`mt-4 w-full px-4 py-2 rounded-md font-medium transition ${
                    !selectedTicket || selectedTicket.available <= 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-sanaa-orange text-white hover:opacity-90"
                  }`}
                  onClick={openPayModal}
                >
                  {selectedTicket && selectedTicket.available <= 0 ? "Sold Out" : "Proceed to Pay"}
                </button>
              </aside>
            </div>
          )}

          {tab === "photos" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {EVENTS.slice(0, 3).map((x) => (
                <div key={x.slug} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={x.image} alt={x.title} className="w-full h-56 object-cover" />
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
      {showPayModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closePayModal}
            aria-hidden="true"
          />
          {/* modal */}
          <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>
              <button
                onClick={closePayModal}
                aria-label="Close"
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="px-5 py-4">
              {/* Summary */}
              <div className="rounded-md bg-sanaa-orange border border-black/10 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Event</span>
                  <span className="font-medium text-white">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Ticket</span>
                  <span className="font-medium text-white">{selectedTicket?.label ?? "--"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Quantity</span>
                  <span className="font-medium text-white">{qty}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-white font-semibold">Total</span>
                  <span className="font-bold text-white">
                    {selectedTicket ? (total === 0 ? "Free" : `KES ${total.toLocaleString()}`) : "--"}
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
                  required={false} // optional overall, but validated if present
                />
                {!emailValid && (
                  <p className="mt-1 text-xs text-rose-600">Please enter a valid email address.</p>
                )}
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

// --- SSG: generate pages for each event ---
export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getEventSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const event = getEventBySlug(slug);
  if (!event) return { notFound: true };
  return { props: { event }, revalidate: 60 };
};
