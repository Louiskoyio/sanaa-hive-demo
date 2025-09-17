// pages/account.tsx
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Page from "@/components/Page";

/* ----------------------------- Endpoints ----------------------------- */
// tweak these if your backend differs
const ME_URL = "/api/me";
const CHANGE_PASSWORD_URL = "/api/auth/change-password";
const CHANGE_EMAIL_URL = "/api/auth/change-email";
const ME_EVENTS_URL = "/api/me/events";

/* ----------------------------- Types ----------------------------- */
type Me = { id: number | string; username: string; email: string };

type EventItem = {
  id: number | string;
  slug: string;
  title: string;
  start_time?: string;   // ISO
  end_time?: string;     // ISO (optional)
  venue?: string;
  status?: string;       // draft | published | past | etc (optional)
};

/* ----------------------------- Helpers ----------------------------- */
const fmtDateTime = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function AccountPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"settings" | "events">("settings");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);

  // forms
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [emailNew, setEmailNew] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // events
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsErr, setEventsErr] = useState<string | null>(null);

  /* ------------------------ Auth load ------------------------ */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const r = await fetch(ME_URL, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        const authed = r.ok && (j?.authenticated ?? false);
        if (!authed) {
          router.replace(`/login?next=${encodeURIComponent("/account")}`);
          return;
        }
        if (!mounted) return;
        setMe(j.user);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load account");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [router]);

  /* ------------------------ Events load ------------------------ */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setEventsErr(null);
        setEventsLoading(true);
        const r = await fetch(ME_EVENTS_URL, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Failed to load events");
        const arr: EventItem[] = Array.isArray(j) ? j : Array.isArray(j?.results) ? j.results : [];
        if (!mounted) return;
        setEvents(arr);
      } catch (e: any) {
        if (!mounted) return;
        setEventsErr(e?.message || "Failed to load events");
        setEvents([]);
      } finally {
        if (mounted) setEventsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ------------------------ Form handlers ------------------------ */
  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwMsg({ type: "err", text: "Please fill all password fields." });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ type: "err", text: "New passwords do not match." });
      return;
    }
    try {
      setPwBusy(true);
      const r = await fetch(CHANGE_PASSWORD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || j?.error || "Failed to change password");
      setPwMsg({ type: "ok", text: "Password changed successfully." });
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch (e: any) {
      setPwMsg({ type: "err", text: e?.message || "Password change failed." });
    } finally {
      setPwBusy(false);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg(null);
    if (!emailNew) {
      setEmailMsg({ type: "err", text: "Enter a new email." });
      return;
    }
    try {
      setEmailBusy(true);
      const r = await fetch(CHANGE_EMAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: emailNew }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || j?.error || "Failed to change email");
      setEmailMsg({ type: "ok", text: "Email updated. Please verify if required." });
      setEmailNew("");
    } catch (e: any) {
      setEmailMsg({ type: "err", text: e?.message || "Email change failed." });
    } finally {
      setEmailBusy(false);
    }
  }

  /* ------------------------ Derived ------------------------ */
  const emailDisplay = me?.email || "—";

  /* ------------------------ Render ------------------------ */
  return (
    <Page>
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Account</h1>
          <div className="flex gap-2">
            <Link href="/profile" className="px-3 py-1.5 rounded-full bg-royal-purple text-white text-sm font-semibold hover:bg-royal-purple/90">
              View Profile
            </Link>
            <Link href="/events" className="px-3 py-1.5 rounded-full bg-sanaa-orange text-white text-sm font-semibold hover:bg-sanaa-orange/90">
              My Events
            </Link>
          </div>
        </div>

        {err && (
          <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-black/10">
          {[
            { id: "settings", label: "Account Settings" },
            { id: "events", label: "Events Dashboard" },
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

        {/* Tab: Account Settings */}
        {tab === "settings" && (
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {/* Change Password */}
            <div className="md:col-span-2 bg-white rounded-xl shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <form onSubmit={submitPassword} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current password</label>
                  <input
                    type="password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New password</label>
                    <input
                      type="password"
                      value={pwNew}
                      onChange={(e) => setPwNew(e.target.value)}
                      className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                    <input
                      type="password"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {pwMsg && (
                  <div
                    className={`text-sm rounded-md px-3 py-2 ${
                      pwMsg.type === "ok"
                        ? "text-green-700 bg-green-50 border border-green-200"
                        : "text-rose-700 bg-rose-50 border border-rose-200"
                    }`}
                  >
                    {pwMsg.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pwBusy}
                    className={`px-5 py-2 rounded-full bg-royal-purple text-white font-semibold ${
                      !pwBusy ? "hover:bg-royal-purple/90" : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {pwBusy ? "Saving…" : "Save password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Email + Verify */}
            <aside className="bg-white rounded-xl shadow p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Email</h4>
                <p className="mt-1 text-sm text-gray-700">{loading ? "Loading…" : emailDisplay}</p>
              </div>

              <form onSubmit={submitEmail} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Change email</label>
                  <input
                    type="email"
                    value={emailNew}
                    onChange={(e) => setEmailNew(e.target.value)}
                    placeholder="you@newdomain.com"
                    className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
                  />
                </div>

                {emailMsg && (
                  <div
                    className={`text-sm rounded-md px-3 py-2 ${
                      emailMsg.type === "ok"
                        ? "text-green-700 bg-green-50 border border-green-200"
                        : "text-rose-700 bg-rose-50 border border-rose-200"
                    }`}
                  >
                    {emailMsg.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={emailBusy}
                    className={`px-5 py-2 rounded-full bg-royal-purple text-white font-semibold ${
                      !emailBusy ? "hover:bg-royal-purple/90" : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {emailBusy ? "Saving…" : "Save email"}
                  </button>
                </div>
              </form>

              <div className="pt-2">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sanaa-orange text-white font-semibold hover:bg-sanaa-orange/90"
                >
                  <img src="/verified-badge.png" className="h-5 w-5" alt="" />
                  Get Verified
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* Tab: Events Dashboard */}
        {tab === "events" && (
          <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-4 border-b border-black/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Your Events</h3>
              <Link
                href="/create-event"
                className="px-3 py-1.5 rounded-full bg-royal-purple text-white text-sm font-semibold hover:bg-royal-purple/90"
              >
                + Create Event
              </Link>
            </div>

            {eventsLoading ? (
              <div className="px-4 py-6 text-sm text-gray-600">Loading events…</div>
            ) : eventsErr ? (
              <div className="m-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                {eventsErr}
              </div>
            ) : !events.length ? (
              <div className="px-4 py-6 text-sm text-gray-600">You have no events yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr className="text-left">
                      <th className="px-4 py-2 font-semibold">Event Name</th>
                      <th className="px-4 py-2 font-semibold">Event Times</th>
                      <th className="px-4 py-2 font-semibold">Venue</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => {
                      const times = ev.end_time
                        ? `${fmtDateTime(ev.start_time)} – ${fmtDateTime(ev.end_time)}`
                        : fmtDateTime(ev.start_time);
                      const status = (ev.status || "").trim() || "—";
                      return (
                        <tr key={String(ev.id)} className="border-t border-black/5">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-sanaa-orange">{ev.title || "Untitled event"}</div>
                            <div className="text-xs text-gray-500">/{ev.slug}</div>
                          </td>
                          <td className="px-4 py-3">{times || "—"}</td>
                          <td className="px-4 py-3">{ev.venue || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/events/${encodeURIComponent(ev.slug)}`}
                                className="px-3 py-1.5 rounded-md bg-white border border-black/10 hover:bg-gray-50"
                              >
                                View
                              </Link>
                              <Link
                                href={`/events/${encodeURIComponent(ev.slug)}/analytics`}
                                className="px-3 py-1.5 rounded-md bg-royal-purple text-white hover:bg-royal-purple/90"
                              >
                                Analytics
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </Page>
  );
}
