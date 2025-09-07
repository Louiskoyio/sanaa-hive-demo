// pages/signup.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import Page from "@/components/Page";

/* ------------------------------ TagInput ------------------------------ */
function TagInput({
  value,
  onChange,
  placeholder = "Add services (press Space or Enter)",
  maxTags = 10,
  maxLength = 24,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
}) {
  const [draft, setDraft] = useState("");

  function commit(tagRaw: string) {
    let t = tagRaw.trim();
    if (!t) return;
    t = t.replace(/[,\s]+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
    if (!t) return;
    if (t.length > maxLength) t = t.slice(0, maxLength);
    if (value.includes(t)) return;
    if (value.length >= maxTags) return;
    onChange([...value, t]);
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === " " || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  function removeAt(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Tags (optional)</label>
      <div className="mt-1 w-full min-h-[42px] rounded-md border border-black/10 px-2 py-1.5 bg-white
                      focus-within:ring-2 focus-within:ring-royal-purple/60 flex flex-wrap gap-1.5">
        {value.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                       bg-royal-purple/10 text-royal-purple border border-royal-purple/20"
          >
            {t}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="rounded-full p-0.5 hover:bg-royal-purple/10"
              aria-label={`Remove ${t}`}
              title="Remove"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[140px] px-2 py-1 text-sm focus:outline-none bg-transparent"
        />
      </div>
      <div className="mt-1 text-[11px] text-gray-500">
        Separate with <span className="font-medium text-royal-purple">Space</span> or{" "}
        <span className="font-medium text-royal-purple">Enter</span>. Up to {maxTags} tags.
      </div>
    </div>
  );
}

/* ------------------------- CategorySelect ------------------------- */
function CategorySelect({
  value,
  onChange,
  options,
  error,
  label = "Category",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  error?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(0, options.findIndex((o) => o === value))
  );
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (!menuRef.current) return;
      if (
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const choice = options[activeIndex] ?? options[0];
        onChange(choice);
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey as any);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey as any);
    };
  }, [open, options, activeIndex, onChange]);

  useEffect(() => {
    const idx = options.findIndex((o) => o === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, options]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-rose-500">*</span>
      </label>

      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`mt-1 w-full flex items-center justify-between rounded-md border px-3 py-2 text-left focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-400 focus:ring-rose-300"
            : "border-black/10 focus:ring-royal-purple/60"
        } bg-white`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Select a category"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 w-full rounded-xl bg-white/80 backdrop-blur-md shadow-lg border border-black/10 overflow-hidden"
        >
          {options.map((opt, i) => {
            const selected = opt === value;
            const active = i === activeIndex;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  btnRef.current?.focus();
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition ${
                  active ? "bg-gray-50" : "bg-transparent"
                } ${selected ? "font-semibold text-gray-900" : "text-gray-800"}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- Types ---------------------------------- */
type FormState = {
  name: string;
  bio: string;
  category: string;
  subcategory: string;           // NEW
  location: string; // "City, Country"
  website: string;
  email: string;
  profileFile: File | null;

  password: string;
  confirmPassword: string;

  tags: string[];
};
type Errors = Partial<Record<keyof FormState | "password" | "confirmPassword", string>>;
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
    subcategory: "",          // NEW
    location: "",
    website: "",
    email: "",
    profileFile: null,
    password: "",
    confirmPassword: "",
    tags: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<StepKey>("account");
  const [showSuccess, setShowSuccess] = useState(false);

  // NEW: network state
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  useEffect(() => {
    if (!form.profileFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(form.profileFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.profileFile]);

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

  // Password strength (0-4)
  const pwScore = useMemo(() => {
    const v = form.password || "";
    let score = 0;
    if (v.length >= 8) score++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return Math.min(score, 4);
  }, [form.password]);

  const pwStrengthLabel =
    ["Very weak", "Weak", "Okay", "Good", "Strong"][pwScore] || "Very weak";
  const pwBarWidth = `${(pwScore / 4) * 100}%`;

  function validateStep(s: StepKey): boolean {
    const next: Errors = {};
    if (s === "account") {
      if (!form.name.trim()) next.name = "Name is required.";
      if (!form.email.trim()) next.email = "Email is required.";
      else if (!emailValid) next.email = "Enter a valid email.";

      if (!form.password) next.password = "Password is required.";
      else if (form.password.length < 8) next.password = "Use at least 8 characters.";
      if (!form.confirmPassword) next.confirmPassword = "Confirm your password.";
      else if (form.password && form.confirmPassword !== form.password)
        next.confirmPassword = "Passwords do not match.";
      // NOTE: category validation moved to "profile" step
    } else if (s === "profile") {
      if (!form.category) next.category = "Select a category."; // moved here
      if (form.location && !locationValid)
        next.location = "Use City, Country (e.g., Nairobi, Kenya).";
      if (form.website && !websiteValid)
        next.website = "Enter a valid URL (e.g., https://example.com).";
    }
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  }

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
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    setField("profileFile", file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateStep("account")) { setStep("account"); return; }
    if (!validateStep("profile")) { setStep("profile"); return; }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("password", form.password);

    // Profile fields:
    fd.append("category", form.category);
    if (form.subcategory) fd.append("subcategory", form.subcategory); // NEW
    if (form.location) fd.append("location", form.location);
    if (form.website) fd.append("website", form.website);
    if (form.bio) fd.append("bio", form.bio);
    if (form.tags.length > 0) fd.append("tags", JSON.stringify(form.tags));
    if (form.profileFile) fd.append("avatar", form.profileFile); // <-- file key is "avatar"

    const DJ = (process.env.NEXT_PUBLIC_DJANGO_API_BASE || "").replace(/\/+$/, "");
    if (!DJ) {
      setErrMsg("Signup is misconfigured: NEXT_PUBLIC_DJANGO_API_BASE is missing.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${DJ}/api/auth/creatives/register/`, {
        method: "POST",
        body: fd, // no Content-Type header — browser sets multipart boundary
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error ||
          data?.detail ||
          (typeof data === "object" ? JSON.stringify(data) : "Signup failed")
        );
      }

      setShowSuccess(true);
    } catch (err: any) {
      alert(err?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  function closeSuccess() {
    setShowSuccess(false);
    router.push("/login");
  }

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

              {/* Name & Email */}
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

              {/* Password & Confirm Password */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="••••••••"
                    className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.password ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
                    }`}
                  />
                  {/* Strength gauge */}
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-verylight-purple/60">
                      <div
                        className="h-1.5 rounded-full bg-royal-purple transition-all"
                        style={{ width: pwBarWidth }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-gray-600">
                      Strength: <span className="text-royal-purple font-medium">{pwStrengthLabel}</span>
                    </div>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setField("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.confirmPassword ? "border-rose-400 focus:ring-rose-300" : "border-black/10 focus:ring-royal-purple/60"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {errMsg && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                  {errMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={goNext}
                  className="px-5 py-2 rounded-full bg-royal-purple text-white font-semibold hover:bg-royal-purple/90"
                >
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
                <label className="block text-sm font-medium text-gray-700">
                  Profile picture (optional)
                </label>
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

              {/* Category & Subcategory */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <CategorySelect
                    value={form.category}
                    onChange={(v) => setField("category", v)}
                    options={CATEGORY_OPTIONS}
                    error={Boolean(errors.category)}
                    label="Category"
                  />
                  {errors.category && (
                    <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subcategory (optional)</label>
                  <input
                    value={form.subcategory}
                    onChange={(e) => setField("subcategory", e.target.value)}
                    placeholder="e.g., DJ, Studio, Street Photographer"
                    className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 border-black/10 focus:ring-royal-purple/60"
                  />
                </div>
              </div>

              {/* Location & Website */}
              <div className="grid md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website (optional)
                  </label>
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
              </div>

              {/* Bio */}
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

              {/* Tags */}
              <TagInput
                value={form.tags}
                onChange={(tags) => setField("tags", tags)}
                placeholder="AfroHouse mixing events photography"
                maxTags={10}
                maxLength={24}
              />

              {errMsg && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                  {errMsg}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-4 py-2 rounded-full bg-sanaa-orange text-white border border-black/10 hover:bg-sanaa-orange/90"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="px-5 py-2 rounded-full bg-royal-purple text-white font-semibold hover:bg-royal-purple/90"
                >
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
                <Row label="Subcategory" value={form.subcategory || "—"} />
                <Row label="Location" value={form.location || "—"} />
                <Row label="Website" value={form.website || "—"} />
                <Row label="Bio" value={form.bio || "—"} />
                <Row label="Tags" value={form.tags.length ? form.tags.join(", ") : "—"} />
              </div>

              {errMsg && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                  {errMsg}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-4 py-2 rounded-full bg-sanaa-orange text-white border border-black/10 hover:bg-sanaa-orange/90"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-full bg-royal-purple text-white font-semibold hover:bg-royal-purple/90 ${
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our Terms & Privacy Policy.
              </p>
            </>
          )}
        </form>
      </section>

      {/* Success Modal */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/50" onClick={closeSuccess} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                Registration successful
              </h3>
              <p className="mt-2 text-sm text-gray-700 text-center">
                You can now log in and complete your profile.
              </p>
              <div className="mt-5 flex items-center justify-center">
                <button
                  onClick={closeSuccess}
                  className="px-4 py-2 rounded-full bg-royal-purple text-white font-medium hover:bg-royal-purple/90"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

/* ------------------------------- Row component ------------------------------ */
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
