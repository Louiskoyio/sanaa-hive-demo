// pages/signup.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Page from "@/components/Page";

type FormState = {
  name: string;
  bio: string;
  category: string;
  location: string; // "City, Country"
  website: string;
  email: string;
  profileFile: File | null;
};
type Errors = Partial<Record<keyof FormState, string>>;
type StepKey = "account" | "profile" | "confirm";

const CATEGORY_OPTIONS = [
  "DJ",
  "Artist",
  "Studio",
  "Photographer",
  "Merchant",
  "Singer",
  "Rapper",
  "Influencer",
  "Other",
];

const STEPS: { id: StepKey; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "profile", label: "Profile" },
  { id: "confirm", label: "Confirm" },
];

export default function SignUp() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    bio: "",
    category: "",
    location: "",
    website: "",
    email: "",
    profileFile: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<StepKey>("account");
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Helpers ---
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // preview avatar
  useEffect(() => {
    if (!form.profileFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(form.profileFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.profileFile]);

  // Validations
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || ""),
    [form.email]
  );
  const locationValid = useMemo(
    () => !form.location || /^[^,]+,\s*[^,]+$/.test(form.location || ""),
    [form.location]
  );
  const websiteValid = useMemo(() => {
    if (!form.website) return true;
    try {
      const withProto = form.website.startsWith("http")
        ? form.website
        : `https://${form.website}`;
      const u = new URL(withProto);
      return Boolean(u.hostname);
    } catch {
      return false;
    }
  }, [form.website]);

  // Validate per step
  function validateStep(s: StepKey): boolean {
    const next: Errors = {};
    if (s === "account") {
      if (!form.name.trim()) next.name = "Name is required.";
      if (!form.email.trim()) next.email = "Email is required.";
      else if (!emailValid) next.email = "Enter a valid email.";
    } else if (s === "profile") {
      if (!form.category) next.category = "Select a category.";
      if (form.location && !locationValid)
        next.location = "Use City, Country (e.g., Nairobi, Kenya).";
      if (form.website && !websiteValid)
        next.website = "Enter a valid URL (e.g., https://example.com).";
    }
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  }

  // Ensure all previous steps valid before jumping forward
  function canGoTo(target: StepKey): boolean {
    const targetIdx = STEPS.findIndex((s) => s.id === target);
    for (let i = 0; i < targetIdx; i++) {
      const ok = validateStep(STEPS[i].id);
      if (!ok) return false;
    }
    return true;
  }

  function goNext() {
    const ok = validateStep(step);
    if (!ok) return;
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].id);
  }
  function goBack() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setField("profileFile", file);
  }
  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    setField("profileFile", file);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // validate all before final submit
    if (!validateStep("account")) { setStep("account"); return; }
    if (!validateStep("profile")) { setStep("profile"); return; }
    // TODO: POST to API (use FormData if uploading)
    setShowSuccess(true);
  }
  function closeSuccess() { setShowSuccess(false); router.push("/"); }

  return (
    <Page>
      <section className="max-w-3xl mx-auto px-4 py-10">
            <div>
            <h3 className="text-2xl font-semibold">Join Sanaa Hive</h3>

              <p className="mt-2 text-black/90 max-w-xl">
                Create your profile, showcase your craft, and connect with the
                Nairobi creative scene.
              </p>
            </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const past = i < stepIndex;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <button
                    onClick={() => { if (past || canGoTo(s.id)) setStep(s.id); }}
                    className={`h-8 w-8 rounded-full grid place-items-center text-sm font-semibold transition
                      ${active ? "bg-sanaa-orange text-white"
                        : past ? "bg-sanaa-orange/10 text-sanaa-orange"
                        : "bg-gray-100 text-gray-600"}`}
                    aria-current={active ? "step" : undefined}
                  >
                    {i + 1}
                  </button>
                  <div className={`text-sm ${active ? "text-sanaa-orange font-semibold" : "text-gray-600"}`}>
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="h-[2px] w-8 rounded-full bg-black/10" />
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-royal-purple text-white">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
        </div>

        {/* Card */}
        <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
          {step === "account" && (
            <>
              <h2 className="text-lg font-semibold text-sanaa-orange">Account</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Asha Kamau"
                    className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.name ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@example.com"
                    className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.email ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={goNext}
                        className="px-5 py-2 rounded-full bg-royal-purple text-white font-semibold hover:bg-royal-purple/90">
                  Continue
                </button>
              </div>
            </>
          )}

          {step === "profile" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>

              {/* Avatar uploader */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile picture (optional)</label>
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                  className={`mt-2 flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition cursor-pointer ${
                    dragActive ? "border-royal-purple bg-royal-purple/5" : "border-black/10 hover:bg-gray-50"
                  }`}
                >
                  <input type="file" accept="image/*" className="hidden" onChange={onFileInput} />
                  <div className="h-16 w-16 rounded-full ring-2 ring-royal-purple/30 overflow-hidden bg-gray-100 grid place-items-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Upload or drop an image</div>
                    <div className="text-gray-600">PNG/JPG up to ~2MB recommended</div>
                  </div>
                </label>
              </div>

              {/* Category & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setField("category", e.target.value)}
                      className={`mt-1 w-full appearance-none rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                        errors.category ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
                      }`}
                    >
                      <option value="" disabled>Select a category</option>
                      {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-[14px] text-gray-500">▾</span>
                  </div>
                  {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location <span className="text-xs text-gray-500">(City, Country)</span>
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => setField("location", e.target.value)}
                    placeholder="Nairobi, Kenya"
                    className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.location ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
                    }`}
                  />
                  {errors.location && <p className="mt-1 text-xs text-rose-600">{errors.location}</p>}
                </div>
              </div>

              {/* Website & Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
                <input
                  value={form.website}
                  onChange={(e) => setField("website", e.target.value)}
                  placeholder="https://example.com"
                  className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.website ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
                  }`}
                />
                {errors.website && <p className="mt-1 text-xs text-rose-600">{errors.website}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bio (optional)</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="Tell us a bit about your creative practice…"
                  rows={4}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-purple/60"
                />
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={goBack} className="px-4 py-2 rounded-full bg-sanaa-orange text-white border border-black/10 hover:bg-gray-50">
                  Back
                </button>
                <button type="button" onClick={goNext}
                        className="px-5 py-2 rounded-full bg-royal-purple text-white font-semibold hover:bg-royal-purple/90">
                  Continue
                </button>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Confirm</h2>
              <div className="rounded-lg border border-black/10 divide-y">
                <Row label="Name" value={form.name || "—"} />
                <Row label="Email" value={form.email || "—"} />
                <Row label="Category" value={form.category || "—"} />
                <Row label="Location" value={form.location || "—"} />
                <Row label="Website" value={form.website || "—"} />
                <Row label="Bio" value={form.bio || "—"} />
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={goBack} className="px-4 py-2 rounded-full bg-sanaa-orange text-white border border-black/10 hover:bg-sanaa-orange/90">
                  Back
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-royal-purple text-white font-semibold hover:bg-royal-purple/90">
                  Create Account
                </button>
              </div>
              <p className="text-xs text-gray-500">By creating an account, you agree to our Terms & Privacy Policy.</p>
            </>
          )}
        </form>
      </section>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={closeSuccess} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">Registration successful</h3>
              <p className="mt-2 text-sm text-gray-700 text-center">
                A verification email has been sent to <span className="font-semibold">{form.email || "your email"}</span>.
              </p>
              <div className="mt-5 flex items-center justify-center">
                <button onClick={closeSuccess} className="px-4 py-2 rounded-full bg-royal-purple text-white font-medium hover:bg-royal-purple/90">
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

// small row renderer for confirm step
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium text-gray-900 text-right max-w-[70%] break-words">
        {value}
      </div>
    </div>
  );
}
