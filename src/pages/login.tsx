// pages/login.tsx
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import Page from "@/components/Page";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true); // NEW: default on (common UX)
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const usernameValid = useMemo(() => username.trim().length > 0, [username]);
  const passwordValid = useMemo(() => password.length >= 6, [password]);
  const canSubmit = usernameValid && passwordValid && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setErrMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }), // <-- send remember
      });

      if (!res.ok) {
        let msg = "Login failed";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }

      const next = (router.query.next as string) || "/events";
      router.replace(next);
    } catch (err: any) {
      setErrMsg(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <section className="max-w-3xl mx-auto px-4 py-10">
        {/* Heading */}
        <div>
          <h3 className="text-2xl font-semibold">Welcome back</h3>
          <p className="mt-2 text-black/90 max-w-xl">
            Log in to manage your events, tickets, and profile on Sanaa Hive.
          </p>
        </div>

        {/* Card */}
        <form onSubmit={onSubmit} className="mt-6 bg-white rounded-xl shadow p-6 md:p-8 space-y-6 max-w-md">
          <h2 className="text-lg font-semibold text-sanaa-orange">Log in</h2>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  !username || usernameValid
                    ? "border-black/10 focus:ring-royal-purple/60"
                    : "border-rose-400 focus:ring-rose-300"
                }`}
                autoFocus
              />
              {!usernameValid && username.length > 0 && (
                <p className="mt-1 text-xs text-rose-600">Username is required.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-xs text-royal-purple hover:underline"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <input
                name="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  !password || passwordValid
                    ? "border-black/10 focus:ring-royal-purple/60"
                    : "border-rose-400 focus:ring-rose-300"
                }`}
              />
              {!passwordValid && password.length > 0 && (
                <p className="mt-1 text-xs text-rose-600">Password must be at least 6 characters.</p>
              )}

              {/* Remember me (NEW) */}
              <label className="mt-3 inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 text-royal-purple focus:ring-royal-purple/60"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
            </div>

            {/* Error banner */}
            {errMsg && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                {errMsg}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-royal-purple hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/" className="px-4 py-2 rounded-full bg-sanaa-orange text-white border border-black/10 hover:bg-sanaa-orange/90">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2 rounded-full bg-royal-purple text-white font-semibold transition ${
                canSubmit ? "hover:bg-royal-purple/90" : "opacity-60 cursor-not-allowed"
              }`}
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social login buttons (no functionality yet) */}
          <div className="flex flex-col gap-3">
            <button type="button" className="flex items-center justify-center gap-3 w-full px-4 py-2 rounded-md border border-black/10 bg-white hover:bg-gray-50">
              <img src="/google.png" alt="Google" className="h-5 w-5" />
              <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
            </button>

            <button type="button" className="flex items-center justify-center gap-3 w-full px-4 py-2 rounded-md border border-black/10 bg-black text-white hover:bg-gray-900">
              <img src="/apple.png" alt="Apple" className="h-5 w-5" />
              <span className="text-sm font-medium">Sign in with Apple</span>
            </button>
          </div>

          <p className="text-xs text-gray-600">
            New here?{" "}
            <Link href="/signup" className="text-royal-purple hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </Page>
  );
}

// Redirect if already authenticated
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_ORIGIN || "http://localhost:3000";
    const me = await fetch(`${base}/api/me`, {
      headers: { cookie: ctx.req.headers.cookie || "" },
    });
    if (me.status === 200) {
      const next = (ctx.query.next as string) || "/events";
      return { redirect: { destination: next, permanent: false } };
    }
  } catch {}
  return { props: {} };
};
