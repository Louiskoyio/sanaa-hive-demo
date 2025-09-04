"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [query, setQuery] = useState("");

  // NEW: login modal state
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const emailValid = !loginEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail);
  const passwordValid = loginPassword.length > 0;
  const canSubmitLogin = emailValid && passwordValid && !!loginEmail;

  // Hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const curr = window.scrollY;
      setShow(curr <= lastScrollY);
      setLastScrollY(curr);
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isOpen]);

  // Trap body scroll when modal open + close on ESC
  useEffect(() => {
    if (loginOpen) {
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLoginOpen(false);
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [loginOpen]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/creatives", label: "Creatives" },
    { href: "/feed", label: "Feed" },
  ];

  const activeClass = (href: string) =>
    pathname === href ? "text-[#d13841]" : "text-gray-700 hover:text-[#d13841]";

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitLogin) return;
    // TODO: replace with your auth flow (NextAuth, API route, etc.)
    console.log("Login payload", {
      email: loginEmail,
      password: "[redacted]",
    });
    setLoginOpen(false);
    setLoginEmail("");
    setLoginPassword("");
  }

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
          show ? "translate-y-0" : "-translate-y-full"
        } bg-white/70 backdrop-blur-md shadow`}
        style={{ height: "var(--nav-height, 64px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-12 items-center"
            style={{ height: "var(--nav-height, 64px)" }}
          >
            {/* Logo */}
            <div className="col-span-3 flex items-center">
              <Link href="/">
                <img
                  src="/logo.png"
                  alt="Sanaa Hive Logo"
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Nav links */}
            <div className="col-span-3 hidden md:flex items-center gap-6 mr-6">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`font-semibold transition-colors ${activeClass(href)}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <div className="col-span-3 hidden md:flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Sanaa Hive"
                    className="w-full rounded-full py-2 pl-4 pr-20 shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-purple/60 bg-white/80 border border-black/5"
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-royal-purple text-white text-sm font-medium hover:opacity-90">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Right icons + Auth + Mobile menu */}
            <div className="col-span-3 flex items-center justify-end gap-3 md:gap-4">
              {/* Notifications */}
              <button className="relative hidden sm:inline-flex" aria-label="Notifications">
                <img
                  src="/assets/navbar/shop.png"
                  alt="Notifications"
                  className="h-6 w-auto"
                />
                <span className="absolute -top-2 -right-2 bg-sanaa-orange text-white rounded-full text-xs px-1">
                  2
                </span>
              </button>

              {/* Profile (placeholder) */}
              <button
                className="hidden sm:inline-flex w-10 h-10 bg-white/70 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white rounded-full border border-black/10"
                aria-label="Profile"
              >
                <img
                  src="/assets/navbar/user.png"
                  alt="Profile"
                  className="h-6 w-auto"
                />
              </button>
              

              {/* NEW: Sign Up + Log In (desktop) */}
              <Link
                href="/signup"
                className="hidden md:inline-flex px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-sm font-medium"
              >
                Sign Up
              </Link>
              <button
                onClick={() => setLoginOpen(true)}
                className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-royal-purple text-white text-sm font-medium hover:bg-royal-purple/90"
              >
                Log In
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsOpen((s) => !s)}
                className="md:hidden text-gray-700 focus:outline-none"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <div className="relative w-6 h-6">
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-800 transform transition duration-300 ${
                      isOpen ? "rotate-45 top-3" : "top-1"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-800 transition duration-300 ${
                      isOpen ? "opacity-0" : "top-3"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-800 transform transition duration-300 ${
                      isOpen ? "-rotate-45 top-3" : "top-5"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown — add auth actions here too */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/70 backdrop-blur-md shadow ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="px-4 pt-3 pb-4 space-y-3">
            {/* Search (mobile) */}
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Sanaa Hive"
                className="w-full rounded-full py-2 pl-4 pr-20 shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-purple/60 bg-white/80 border border-black/5"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-royal-purple text-white text-sm font-medium hover:opacity-90">
                Search
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col space-y-2">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`block font-semibold transition-colors ${activeClass(href)}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Auth buttons (mobile) */}
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-sm font-medium text-center"
              >
                Sign Up
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setLoginOpen(true);
                }}
                className="flex-1 px-3 py-2 rounded-full bg-royal-purple text-white text-sm font-medium hover:bg-royal-purple/90"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* LOGIN MODAL */}
      {loginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setLoginOpen(false)}
            aria-hidden="true"
          />
          {/* modal */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Log In</h3>
              <button
                onClick={() => setLoginOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="px-5 py-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    autoFocus
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      emailValid ? "border-black/10 focus:ring-royal-purple/60" : "border-rose-400 focus:ring-rose-300"
                    }`}
                    placeholder="you@example.com"
                  />
                  {!emailValid && (
                    <p className="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      passwordValid ? "border-black/10 focus:ring-royal-purple/60" : "border-rose-400 focus:ring-rose-300"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-royal-purple hover:underline">
                  Forgot password?
                </Link>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLoginOpen(false)}
                  className="px-4 py-2 rounded-md bg-sanaa-orange text-white border border-black/10 hover:bg-sanaa-orange/90"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitLogin}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    canSubmitLogin
                      ? "bg-royal-purple text-white hover:bg-royal-purple/90"
                      : "bg-verylight-purple text-white hover:bg-verylight-purple/90 cursor-not-allowed"
                  }`}
                >
                  Log In
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-600">
                Don’t have an account?{" "}
                <Link href="/signup" className="text-royal-purple hover:underline" onClick={() => setLoginOpen(false)}>
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
