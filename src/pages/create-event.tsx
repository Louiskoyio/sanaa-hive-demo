// pages/create-event.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import type { SessionUser } from "@/components/Navbar";

/* ------------------------------------------------------------------ */
/* Direct-to-Django helpers                                            */
/* ------------------------------------------------------------------ */
function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

const DJ = (process.env.NEXT_PUBLIC_DJANGO_API_BASE || "").replace(/\/+$/, "");
if (!DJ) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_DJANGO_API_BASE is missing");
}

async function djFetch(path: string, init?: RequestInit) {
  return fetch(`${DJ}${path}`, {
    credentials: "include", // send cookies (JWT/Session)
    ...init,
  });
}

/* ------------------------------------------------------------------ */
/* Utility                                                             */
/* ------------------------------------------------------------------ */
function clsx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      (input || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}
function formatMoneyKES(n: number) {
  if (!Number.isFinite(n)) return "–";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `KES ${n.toLocaleString()}`;
  }
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type TierKey = "regular" | "vip" | "vvip";
type Tier = {
  key: TierKey;
  label: string;
  enabled: boolean;
  price: string;      // controlled input
  allocation: string; // controlled input
};
type EventForm = {
  title: string;
  description: string;
  venue: string;
  start: string; // YYYY-MM-DDTHH:mm
  end: string;   // YYYY-MM-DDTHH:mm
  totalTickets: string;
  coverFile?: File | null;
  coverPreview?: string | null;
  autoBalance: boolean;
  tiers: Record<TierKey, Tier>;
  tagsInput: string; // comma-separated -> JSON list
};
type ApiEvent = { id: number; slug: string; organizer_slug?: string | null };

/* ------------------------------------------------------------------ */
/* Summary card extracted so we can reuse it inside the success modal  */
/* ------------------------------------------------------------------ */
function EventSummaryCard({
  form,
  totalTicketsNum,
  allocationSum,
  remaining,
  errors,
}: {
  form: EventForm;
  totalTicketsNum: number;
  allocationSum: number;
  remaining: number;
  errors: Record<string, string>;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      {/* Cover preview */}
      <div className="rounded-xl overflow-hidden border bg-gray-50">
        {form.coverPreview ? (
          <img src={form.coverPreview} className="w-full h-40 object-cover" />
        ) : (
          <div className="h-40 grid place-items-center text-gray-400 text-sm">No cover selected</div>
        )}
      </div>

      {/* Basic info */}
      <div className="mt-4 space-y-1">
        <p className="font-bold text-base text-royal-purple">{form.title || "Untitled event"}</p>
        <p className="text-sm text-gray-500">{form.venue || "Venue TBD"}</p>
        <p className="text-xs text-gray-500">
          {form.start ? new Date(form.start).toLocaleString() : "Start –"} →{" "}
          {form.end ? new Date(form.end).toLocaleString() : "End –"}
        </p>
      </div>

      <hr className="my-3 border-gray-200" />

      {/* Tickets overview */}
      <div className="flex items-center justify-between text-sm">
        <span>Total tickets</span>
        <span className="font-semibold text-royal-purple">{totalTicketsNum || 0}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Allocated</span>
        <span className="font-semibold text-royal-purple">{allocationSum}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Remaining</span>
        <span className="px-2 py-0.5 rounded-full text-xs bg-royal-purple text-white">{remaining}</span>
      </div>

      {/* Tier chips */}
      <div className="mt-3 grid gap-2 ">
        {(["regular", "vip", "vvip"] as TierKey[]).map((key) => {
          const t = form.tiers[key];
          if (!t.enabled) return null;
          const price = parseFloat(t.price || "0") || 0;
          const alloc = parseInt(t.allocation || "0", 10) || 0;
          return (
            <div key={key} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-royal-purple text-white px-2 py-0.5 text-xs font-medium">
                  {t.label}
                </span>
                <span className="text-sm text-gray-500">{formatMoneyKES(price)}</span>
              </div>
              <span className="text-sm font-medium">{alloc} seats</span>
            </div>
          );
        })}
      </div>

      {/* Projected revenue */}
      <hr className="my-2 border-gray-200" />
      <div className="flex items-center justify-between">
        <p className="text-sm">Projected max revenue</p>
        <p className="font-semibold text-royal-purple">
          {formatMoneyKES(
            (["regular", "vip", "vvip"] as TierKey[])
              .filter((k) => form.tiers[k].enabled)
              .reduce((acc, k) => {
                const t = form.tiers[k];
                const p = parseFloat(t.price || "0") || 0;
                const a = parseInt(t.allocation || "0", 10) || 0;
                return acc + p * a;
              }, 0)
          )}
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium mb-1">Fix the following:</p>
          <ul className="list-disc pl-5 space-y-1">
            {Object.values(errors).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function CreateEventPage({ user }: { user: SessionUser }) {
  const router = useRouter();
  const isCreative = Boolean((user as any)?.is_creator ?? true);

  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    venue: "",
    start: "",
    end: "",
    totalTickets: "",
    coverFile: null,
    coverPreview: null,
    autoBalance: true,
    tagsInput: "",
    tiers: {
      regular: { key: "regular", label: "Regular", enabled: true, price: "", allocation: "" },
      vip:     { key: "vip",     label: "VIP",     enabled: true, price: "", allocation: "" },
      vvip:    { key: "vvip",    label: "VVIP",    enabled: false, price: "", allocation: "" },
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<ApiEvent | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* Derived values */
  const totalTicketsNum = useMemo(
    () => parseInt(form.totalTickets || "0", 10) || 0,
    [form.totalTickets]
  );
  const allocationSum = useMemo(() => {
    return Object.values(form.tiers)
      .filter((t) => t.enabled)
      .reduce((acc, t) => acc + (parseInt(t.allocation || "0", 10) || 0), 0);
  }, [form.tiers]);
  const remaining = useMemo(
    () => Math.max(0, totalTicketsNum - allocationSum),
    [allocationSum, totalTicketsNum]
  );
  const timeValid = useMemo(() => {
    if (!form.start || !form.end) return true;
    const start = new Date(form.start);
    const end = new Date(form.end);
    return start.getTime() < end.getTime();
  }, [form.start, form.end]);

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      form.title.trim().length > 0 &&
      form.venue.trim().length > 0 &&
      timeValid &&
      totalTicketsNum > 0 &&
      allocationSum === totalTicketsNum &&
      Object.values(form.tiers)
        .filter((t) => t.enabled)
        .every((t) => (parseFloat(t.price || "0") || 0) >= 0)
    );
  }, [form, allocationSum, timeValid, totalTicketsNum, submitting]);

  /* Auto-balance allocation across enabled tiers */
  useEffect(() => {
    if (!form.autoBalance) return;
    if (totalTicketsNum <= 0) return;
    const enabledTiers = Object.values(form.tiers).filter((t) => t.enabled);
    if (enabledTiers.length === 0) return;

    const currentAlloc = enabledTiers.map((t) => parseInt(t.allocation || "0", 10) || 0);
    const sum = currentAlloc.reduce((a, b) => a + b, 0);
    let diff = totalTicketsNum - sum;
    if (diff === 0) return;

    const base = Math.trunc(diff / enabledTiers.length);
    let remainder = diff % enabledTiers.length;

    setForm((prev) => {
      const newTiers = { ...prev.tiers };
      enabledTiers.forEach((tier) => {
        const curr = parseInt(newTiers[tier.key].allocation || "0", 10) || 0;
        let add = base;
        if (remainder !== 0) {
          add += remainder > 0 ? 1 : -1;
          remainder += remainder > 0 ? -1 : 1;
        }
        const target = clamp(curr + add, 0, totalTicketsNum);
        newTiers[tier.key] = { ...newTiers[tier.key], allocation: String(target) };
      });
      return { ...prev, tiers: newTiers };
    });
  }, [totalTicketsNum, form.autoBalance]);

  function setTier<K extends keyof Tier>(key: TierKey, field: K, value: Tier[K]) {
    setForm((prev) => ({ ...prev, tiers: { ...prev.tiers, [key]: { ...prev.tiers[key], [field]: value } } }));
  }
  function onFilePick(file?: File | null) {
    if (!file) {
      setForm((p) => ({ ...p, coverFile: null, coverPreview: null }));
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((p) => ({ ...p, coverFile: file, coverPreview: url }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.venue.trim()) e.venue = "Venue is required";
    if (!timeValid) e.time = "End time must be after start time";
    if (totalTicketsNum <= 0) e.totalTickets = "Enter total number of tickets";
    if (allocationSum !== totalTicketsNum) e.allocation = "Ticket tier allocation must add up to total";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function createEvent(): Promise<ApiEvent> {
    const tiersArray = (Object.keys(form.tiers) as TierKey[])
      .map((k) => form.tiers[k])
      .filter((t) => t.enabled)
      .map((t) => ({
        key: t.key,
        price: Number(parseFloat(t.price || "0") || 0),
        allocation: Number(parseInt(t.allocation || "0", 10) || 0),
      }));

    const payloadBase = {
      title: form.title.trim(),
      description: form.description.trim(),
      venue: form.venue.trim(),
      start_at: new Date(form.start).toISOString(),
      end_at: new Date(form.end).toISOString(),
      total_tickets: parseInt(form.totalTickets || "0", 10) || 0,
      tiers: tiersArray,
      tags: parseTags(form.tagsInput),
    };

    // CSRF (only if your Django checks CSRF for cookie-auth POST)
    const csrf = getCookie("csrftoken");

    let res: Response;
    if (form.coverFile) {
      const fd = new FormData();
      fd.append("title", payloadBase.title);
      fd.append("description", payloadBase.description);
      fd.append("venue", payloadBase.venue);
      fd.append("start_at", payloadBase.start_at);
      fd.append("end_at", payloadBase.end_at);
      fd.append("total_tickets", String(payloadBase.total_tickets));
      fd.append("tiers", JSON.stringify(payloadBase.tiers));
      fd.append("tags", JSON.stringify(payloadBase.tags));
      fd.append("cover_image", form.coverFile); // field name matches your model

      res = await djFetch(`/api/events/`, {
        method: "POST",
        headers: csrf ? { "X-CSRFToken": csrf } : undefined,
        body: fd, // don't set Content-Type
      });
    } else {
      res = await djFetch(`/api/events/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRFToken": csrf } : {}),
        },
        body: JSON.stringify(payloadBase),
      });
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with ${res.status}`);
    }
    return (await res.json()) as ApiEvent;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setCreatedEvent(null);
    if (!validate()) return;

    try {
      setSubmitting(true);
      const created = await createEvent();
      setCreatedEvent(created); // ← this triggers the success modal
    } catch (err: any) {
      try {
        const json = JSON.parse(err.message);
        setSubmitError(typeof json === "object" ? JSON.stringify(json, null, 2) : String(err.message || "Failed to create event"));
      } catch {
        setSubmitError(String(err.message || "Failed to create event"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* Success modal close → redirect */
  function goToCreatedEvent() {
    if (createdEvent?.slug) {
      router.push(`/events/${encodeURIComponent(createdEvent.slug)}`);
    } else {
      router.push("/events");
    }
  }

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Create Event</h1>
        <p className="text-gray-500 mt-1">
          Draft your event details. Ticket generation & QR validation will come later.
        </p>
      </div>

      {!isCreative ? (
        <div className="rounded-2xl border bg-yellow-50 p-6 text-yellow-900">
          You must be a <strong>Creative</strong> to create events.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 bg-white/70 rounded-2xl border p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium">Title</label>
                <input
                  id="title"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                  placeholder="e.g., Soulful Sundays: Live at The Garden"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                  rows={5}
                  placeholder="Tell attendees what to expect..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Venue */}
              <div>
                <label htmlFor="venue" className="block text-sm font-medium">Venue</label>
                <input
                  id="venue"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                  placeholder="Venue name • City, Country"
                  value={form.venue}
                  onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
                />
                {errors.venue && <p className="mt-1 text-sm text-red-600">{errors.venue}</p>}
              </div>

              {/* Start / End */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="start" className="block text-sm font-medium">Start time</label>
                  <Clock className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-gray-400" />
                  <input
                    id="start"
                    type="datetime-local"
                    className="mt-1 w-full rounded-xl border pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                    value={form.start}
                    onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="end" className="block text_sm font-medium">End time</label>
                  <Calendar className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-gray-400" />
                  <input
                    id="end"
                    type="datetime-local"
                    className="mt-1 w-full rounded-xl border pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                    value={form.end}
                    onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))}
                  />
                </div>
              </div>
              {!timeValid && <p className="text-sm text-red-600">End time must be after start time.</p>}

              {/* Cover Image */}
              <div>
                <span className="block text-sm font-medium">Cover image</span>
                <div
                  className={clsx(
                    "mt-1 border-2 border-dashed rounded-2xl p-6 flex items-center justify-between gap-4",
                    form.coverPreview ? "border-gray-200" : "border-gray-300/70"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {form.coverPreview ? (
                      <img src={form.coverPreview} alt="Cover preview" className="h-20 w-32 object-cover rounded-lg" />
                    ) : (
                      <div className="h-20 w-32 grid place-items-center bg-gray-100 rounded-lg text-sm text-gray-500">
                        No image
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Upload a cover (JPG/PNG, ≤ 5MB)</p>
                      <p className="text-xs text-gray-500">Recommended 1200×600px. Appears on listings & event page.</p>
                      <div className="flex gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 rounded-lg border bg-sanaa-orange text-white hover:bg-sanaa-orange/70"
                        >
                          Choose file
                        </button>
                        {form.coverFile && (
                          <button
                            type="button"
                            onClick={() => onFilePick(null)}
                            className="px-3 py-2 rounded-lg border bg-sanaa-orange text-white hover:bg-sanaa-orange/70"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size > 5 * 1024 * 1024) {
                      alert("File too large. Max 5MB.");
                      return;
                    }
                    onFilePick(f || null);
                  }}
                />
              </div>

              <hr className="border-gray-200" />

              {/* Tickets */}
              <div>
                <label htmlFor="totalTickets" className="block text-sm font-medium">Total tickets</label>
                <div className="mt-1">
                  <input
                    id="totalTickets"
                    inputMode="numeric"
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                    placeholder="e.g., 500"
                    value={form.totalTickets}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      setForm((p) => ({ ...p, totalTickets: v }));
                    }}
                  />
                </div>
                {errors.totalTickets && <p className="mt-1 text-sm text-red-600">{errors.totalTickets}</p>}
              </div>

              {/* Tags (optional) */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium">Tags (optional)</label>
                <input
                  id="tags"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                  placeholder="e.g., music, nairobi, live"
                  value={form.tagsInput}
                  onChange={(e) => setForm((p) => ({ ...p, tagsInput: e.target.value }))}
                />
                <p className="mt-1 text-xs text-gray-500">Comma-separated. Stored as a JSON list on the event.</p>
              </div>

              {/* Auto-balance toggle */}
              <div className="flex items-center justify-between rounded-xl border p-3 bg-gray-50">
                <div>
                  <p className="text-sm font-medium">Auto-balance tier allocation</p>
                  <p className="text-xs text-gray-500">Evenly distribute remaining tickets across enabled tiers.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.autoBalance}
                    onChange={(e) => setForm((p) => ({ ...p, autoBalance: e.target.checked }))}
                  />
                  <span className="h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-sanaa-orange relative transition-colors">
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>

              {/* Tier table */}
              <div className="rounded-2xl border overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-sm font-medium">
                  <div className="col-span-3">Tier</div>
                  <div className="col-span-3">Price (KES)</div>
                  <div className="col-span-3">Allocation</div>
                  <div className="col-span-3 text-right">Enabled</div>
                </div>

                {(["regular", "vip", "vvip"] as TierKey[]).map((key) => {
                  const tier = form.tiers[key];
                  return (
                    <div key={key} className="grid grid-cols-12 items-center px-4 py-3 border-t">
                      <div className="col-span-3 font-medium">{tier.label}</div>
                      <div className="col-span-3">
                        <input
                          inputMode="numeric"
                          placeholder="e.g., 1500"
                          className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                          value={tier.price}
                          onChange={(e) => setTier(key, "price", e.target.value.replace(/[^0-9.]/g, ""))}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          inputMode="numeric"
                          placeholder="e.g., 300"
                          className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple"
                          value={tier.allocation}
                          onChange={(e) => setTier(key, "allocation", e.target.value.replace(/[^0-9]/g, ""))}
                        />
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-sanaa-orange"
                          checked={tier.enabled}
                          onChange={(e) => setTier(key, "enabled", e.target.checked)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.allocation && <p className="mt-1 text-sm text-red-600">{errors.allocation}</p>}

              {/* Submit */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={clsx(
                    "px-6 py-2 rounded-xl text-white",
                    canSubmit ? "bg-black hover:bg-neutral-800" : "bg-gray-400 cursor-not-allowed"
                  )}
                >
                  {submitting ? "Creating..." : "Save draft"}
                </button>
                {submitError && <span className="text-xs text-red-600 break-all">{submitError}</span>}
              </div>
            </form>
          </div>

          {/* Right: Live Summary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <EventSummaryCard
              form={form}
              totalTicketsNum={totalTicketsNum}
              allocationSum={allocationSum}
              remaining={remaining}
              errors={errors}
            />
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {createdEvent && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={goToCreatedEvent}
            aria-hidden="true"
          />
          {/* modal */}
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Event created successfully</h3>
              <button
                onClick={goToCreatedEvent}
                aria-label="Close"
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-5 grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-700">
                  Your event has been created. You can review it now.
                </p>
                <div className="mt-3 text-sm">
                  <div className="text-gray-600">Slug</div>
                  <div className="font-semibold text-royal-purple break-all">{createdEvent.slug}</div>
                </div>
                <button
                  onClick={goToCreatedEvent}
                  className="mt-5 inline-flex items-center justify-center px-4 py-2 rounded-md bg-sanaa-orange text-white font-medium hover:opacity-90"
                >
                  View event
                </button>
              </div>

              {/* Reuse the same summary card in the modal */}
              <EventSummaryCard
                form={form}
                totalTicketsNum={totalTicketsNum}
                allocationSum={allocationSum}
                remaining={remaining}
                errors={{}} // show a clean card in success
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
