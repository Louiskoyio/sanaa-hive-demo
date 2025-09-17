// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

export type SessionUser = { id: number; username: string; email: string } | null;

const DEFAULT_AVATAR = "/assets/navbar/user.png";
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || "http://localhost:8000").replace(/\/+$/, "");

function toImageSrc(raw?: string): string {
  const v = (raw || "").trim();
  if (!v) return DEFAULT_AVATAR;
  if (/^(https?:)?\/\//i.test(v) || /^data:/i.test(v)) return v;
  return `${MEDIA_BASE}/${v.replace(/^\/+/, "")}`;
}

type SearchCreative = { slug: string; display_name: string };
type SearchEvent = { slug: string; title: string };

export default function Navbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auth state (derived from API, not only the prop)
  const [authed, setAuthed] = useState<boolean>(Boolean(user));
  const [sessionUser, setSessionUser] = useState<SessionUser>(user);

  // Search state
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [results, setResults] = useState<{ events: SearchEvent[]; creatives: SearchCreative[] }>({
    events: [],
    creatives: [],
  });

  // Profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // Avatar state
  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR);

  /* ---------------- Sync auth with server on mount & route changes ---------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        if (!mounted) return;
        if (r.ok) {
          const j = await r.json().catch(() => ({}));
          const isAuthenticated = Boolean(j?.authenticated);
          setAuthed(isAuthenticated);
          setSessionUser(isAuthenticated ? j?.user ?? null : null);
        } else {
          setAuthed(false);
          setSessionUser(null);
        }
      } catch {
        if (!mounted) return;
        setAuthed(false);
        setSessionUser(null);
      }
    })();
    return () => { mounted = false; };
  }, [pathname]); // re-check when navigating (e.g., after login redirect)

  /* ---------------- Load avatar when authed ---------------- */
  useEffect(() => {
    let mounted = true;
    if (!authed) {
      setAvatarSrc(DEFAULT_AVATAR);
      return;
    }
    (async () => {
      try {
        // Single, stable endpoint for your profile
        const r = await fetch("/api/me/profile", { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!mounted) return;
        setAvatarSrc(toImageSrc(j?.avatar_url));
      } catch {
        if (!mounted) return;
        setAvatarSrc(DEFAULT_AVATAR);
      }
    })();
    return () => { mounted = false; };
  }, [authed]);

  /* ---------------- Hide/show on scroll ---------------- */
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

  /* ---------------- Close dropdowns & mobile menu on route change ---------------- */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setIsOpen(false);
  }, [pathname]);

  /* ---------------- Close menus on outside click + Esc ---------------- */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuOpen && menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false);
      if (searchOpen && searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, searchOpen]);

  /* ---------------- Prevent body scroll when mobile menu is open ---------------- */
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  /* ---------------- Logout ---------------- */
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setAuthed(false);
    setSessionUser(null);
    setAvatarSrc(DEFAULT_AVATAR);
    router.replace("/");
    setMenuOpen(false);
  }

  /* ---------------- Debounced search ---------------- */
  const minChars = 2;
  useEffect(() => {
    const q = query.trim();
    if (q.length < minChars) {
      setSearchOpen(false);
      setResults({ events: [], creatives: [] });
      setSearchErr(null);
      return;
    }
    setSearchOpen(true);
    setSearchLoading(true);
    setSearchErr(null);

    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        // 1) Try a unified backend search
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (r.ok) {
          const j = await r.json();
          const ev = normalizeEvents(j);
          const cr = normalizeCreatives(j);
          setResults({ events: ev.slice(0, 5), creatives: cr.slice(0, 5) });
        } else {
          // 2) Fallback: fetch lists and filter client-side
          const [evR, crR] = await Promise.allSettled([
            fetch(`/api/events/list/all/`, { cache: "no-store", signal: ctrl.signal }),
            // Exclude suspended creatives in fallback too:
            fetch(`/api/creatives/?suspended=false`, { cache: "no-store", signal: ctrl.signal }),
          ]);

          const evJ = evR.status === "fulfilled" ? await evR.value.json().catch(() => []) : [];
          const crJ = crR.status === "fulfilled" ? await crR.value.json().catch(() => []) : [];

          const allEv = normalizeEvents(evJ);
          const allCr = normalizeCreatives(crJ);

          const nq = q.toLowerCase();
          const fEv = allEv.filter((e) => (e.title || "").toLowerCase().includes(nq)).slice(0, 5);
          const fCr = allCr.filter((c) => (c.display_name || "").toLowerCase().includes(nq)).slice(0, 5);

          setResults({ events: fEv, creatives: fCr });
        }
      } catch (e: any) {
        if (ctrl.signal.aborted) return;
        setSearchErr("Search failed");
        setResults({ events: [], creatives: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [query]);

  // helpers to normalize potential shapes
  function normalizeEvents(data: any): SearchEvent[] {
    const pick = (x: any) => ({ slug: String(x?.slug ?? ""), title: String(x?.title ?? x?.name ?? "") });
    if (Array.isArray(data)) return data.map(pick).filter((x) => x.slug && x.title);
    if (Array.isArray(data?.results)) return data.results.map(pick).filter((x: any) => x.slug && x.title);
    if (Array.isArray(data?.events)) return data.events.map(pick).filter((x: any) => x.slug && x.title);
    if (Array.isArray(data?.data?.events)) return data.data.events.map(pick).filter((x: any) => x.slug && x.title);
    return [];
  }
  function normalizeCreatives(data: any): SearchCreative[] {
    const pick = (x: any) => ({ slug: String(x?.slug ?? ""), display_name: String(x?.display_name ?? x?.name ?? "") });
    if (Array.isArray(data)) return data.map(pick).filter((x) => x.slug && x.display_name);
    if (Array.isArray(data?.results)) return data.results.map(pick).filter((x: any) => x.slug && x.display_name);
    if (Array.isArray(data?.creatives)) return data.creatives.map(pick).filter((x: any) => x.slug && x.display_name);
    if (Array.isArray(data?.data?.creatives)) return data.data.creatives.map(pick).filter((x: any) => x.slug && x.display_name);
    return [];
  }

  const totalResults = useMemo(
    () => results.events.length + results.creatives.length,
    [results.events.length, results.creatives.length]
  );

  function handleSearchEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    if (results.events[0]) {
      router.push(`/events/${encodeURIComponent(results.events[0].slug)}`);
      setSearchOpen(false);
    } else if (results.creatives[0]) {
      router.push(`/creatives/${encodeURIComponent(results.creatives[0].slug)}`);
      setSearchOpen(false);
    }
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/creatives", label: "Creatives" },
  ];

  const activeClass = (href: string) =>
    pathname === href ? "text-white" : "text-white hover:text-[#d13841]";

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
          show ? "translate-y-0" : "-translate-y-full"
        } bg-gradient-to-r from-royal-purple/90 via-royal-purple/80 to-sanaa-orange/90 backdrop-blur-lg shadow`}
        style={{ height: "var(--nav-height, 64px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 items-center" style={{ height: "var(--nav-height, 64px)" }}>
            {/* Logo */}
            <div className="col-span-3 flex items-center">
              <Link href="/"><img src="/logo-w.png" alt="Sanaa Hive Logo" className="h-10 w-auto" /></Link>
            </div>

            {/* Nav links (desktop) */}
            <div className="col-span-3 hidden md:flex items-center gap-6 mr-6">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className={`font-semibold transition-colors ${activeClass(href)}`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Search (desktop) */}
            <div className="col-span-3 hidden md:flex items-center justify-center" ref={searchRef}>
              <div className="w-full max-w-sm relative">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (query.trim().length >= minChars) setSearchOpen(true); }}
                    onKeyDown={handleSearchEnter}
                    placeholder="Search creatives or events"
                    className="w-full rounded-full py-2 pl-4 pr-20 shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-purple/60 bg-white/80 border border-black/5"
                  />
                  <button
                    onClick={() => {
                      if (results.events[0]) {
                        router.push(`/events/${encodeURIComponent(results.events[0].slug)}`);
                        setSearchOpen(false);
                      } else if (results.creatives[0]) {
                        router.push(`/creatives/${encodeURIComponent(results.creatives[0].slug)}`);
                        setSearchOpen(false);
                      }
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-sanaa-orange text-white text-sm font-medium hover:opacity-90"
                  >
                    Search
                  </button>
                </div>

                {searchOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-black/10 rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-80 overflow-auto py-2">
                      {searchLoading && <div className="px-3 py-2 text-sm text-gray-600">Searching…</div>}
                      {!searchLoading && searchErr && <div className="px-3 py-2 text-sm text-rose-700">{searchErr}</div>}
                      {!searchLoading && !searchErr && totalResults === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-600">No results</div>
                      )}

                      {/* Events */}
                      {!searchLoading && results.events.length > 0 && (
                        <>
                          <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-500">Events</div>
                          <ul className="pb-1">
                            {results.events.map((e) => (
                              <li key={`ev-${e.slug}`}>
                                <Link
                                  href={`/events/${encodeURIComponent(e.slug)}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                                  onClick={() => setSearchOpen(false)}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M7 3v3M17 3v3M3 8h18M5 21h14a2 2 0 0 0 2-2V8H3v11a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                  <span className="truncate">{e.title}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {/* Creatives */}
                      {!searchLoading && results.creatives.length > 0 && (
                        <>
                          <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-500">Creatives</div>
                          <ul className="pb-2">
                            {results.creatives.map((c) => (
                              <li key={`cr-${c.slug}`}>
                                <Link
                                  href={`/creatives/${encodeURIComponent(c.slug)}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                                  onClick={() => setSearchOpen(false)}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm8 9a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="truncate">{c.display_name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="col-span-3 flex items-center justify-end gap-3 md:gap-4">
              {/* Profile + dropdown (desktop) */}
              {authed && (
                <div className="relative hidden sm:block" ref={menuRef}>
                  <div className="flex items-center">
                    <Link
                      href="/profile"
                      className="hidden sm:inline-flex h-10 w-10 overflow-hidden rounded-full border border-white/30"
                      aria-label="Profile"
                      title={sessionUser?.username || "My Account"}
                    >
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="h-10 w-10 object-cover"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (img.src.endsWith(DEFAULT_AVATAR)) return;
                          img.src = DEFAULT_AVATAR;
                        }}
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setMenuOpen((s) => !s)}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      className="hidden sm:inline-flex p-2 text-white hover:text-white/90"
                      title="Open menu"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {menuOpen && (
                    <div
                      role="menu"
                      aria-label="Profile menu"
                      className="absolute right-0 mt-2 w-44 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-black/10 overflow-hidden z-50"
                    >
                      <Link
                        href="/events"
                        className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-royal-purple hover:text-white"
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                      >
                        My Events
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-royal-purple hover:text-white"
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/account"
                        className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-royal-purple hover:text-white"
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2.5 text-sm hover:bg-royal-purple hover:text-white"
                        role="menuitem"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Auth actions (desktop) */}
              {!authed && (
                <>
                  <Link
                    href="/signup"
                    className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-royal-purple text-white text-sm font-semibold hover:bg-royal-purple/90"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-royal-purple text-white text-sm font-semibold hover:bg-royal-purple/90"
                  >
                    Log In
                  </Link>
                </>
              )}

              {/* Mobile hamburger (always visible) */}
              <button
                onClick={() => setIsOpen((s) => !s)}
                className="md:hidden text-white focus:outline-none"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute h-0.5 w-6 bg-white transform transition duration-300 ${isOpen ? "rotate-45 top-3" : "top-1"}`} />
                  <span className={`absolute h-0.5 w-6 bg-white transition duration-300 ${isOpen ? "opacity-0" : "top-3"}`} />
                  <span className={`absolute h-0.5 w-6 bg-white transform transition duration-300 ${isOpen ? "-rotate-45 top-3" : "top-5"}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ---------- MOBILE MENU PANEL ---------- */}
        <div
          className={`md:hidden absolute inset-x-0 top-full origin-top bg-white/95 backdrop-blur-md border-t border-black/10 shadow-lg transition-transform duration-200 ${
            isOpen ? "scale-y-100" : "scale-y-0"
          }`}
          style={{ transformOrigin: "top" }}
          aria-hidden={!isOpen}
        >
          <div className="px-4 py-3 flex flex-col gap-2">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-2 h-px bg-black/10" />

            {authed ? (
              <>
                <Link
                  href="/events"
                  className="block px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  My Events
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/account"
                  className="block px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/signup"
                  className="flex-1 text-center px-3 py-2 rounded-lg bg-royal-purple text-white font-semibold hover:bg-royal-purple/90"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="flex-1 text-center px-3 py-2 rounded-lg bg-royal-purple text-white font-semibold hover:bg-royal-purple/90"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile overlay behind the panel */}
        {isOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </nav>
    </>
  );
}
