// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export type SessionUser = { id: number; username: string; email: string } | null;

export default function Navbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [query, setQuery] = useState("");

  // Profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  // Close dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on outside click + Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore errors
    }
    router.replace("/"); // redirect home
    setMenuOpen(false);
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/creatives", label: "Creatives" },
  ];

  const activeClass = (href: string) =>
    pathname === href ? "text-[#d13841]" : "text-white hover:text-[#d13841]";

  const isAuthed = Boolean(user);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
          show ? "translate-y-0" : "-translate-y-full"
        } bg-royal-purple/70 backdrop-blur-md shadow`}
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
                <img src="/logo.png" alt="Sanaa Hive Logo" className="h-10 w-auto" />
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
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-sanaa-orange text-white text-sm font-medium hover:opacity-90">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="col-span-3 flex items-center justify-end gap-3 md:gap-4">
              {/* Profile + dropdown */}
              {isAuthed && (
                <div className="relative" ref={menuRef}>
                  <div className="flex items-center">
                    <Link
                      href="/profile"
                      className="hidden sm:inline-flex w-10 h-10 bg-white/70 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white rounded-full border border-black/10"
                      aria-label="Profile"
                      title={user?.username || "My Account"}
                    >
                      <img src="/assets/navbar/user.png" alt="Profile" className="h-6 w-auto" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMenuOpen((s) => !s)}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 hover:bg-white text-gray-700"
                      title="Open menu"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
              {!isAuthed && (
                <>
                  <Link
                    href="/signup"
                    className="hidden md:inline-flex px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-royal-purple text-white text-sm font-medium hover:bg-royal-purple/90"
                  >
                    Log In
                  </Link>
                </>
              )}

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
      </nav>
    </>
  );
}
