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

  const links = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/creatives", label: "Creatives" },
    { href: "/feed", label: "Feed" },
  ];

  const activeClass = (href: string) =>
    pathname === href
      ? "text-[#d13841]"
      : "text-gray-700 hover:text-[#d13841]";

  return (
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
                  placeholder="Search creatives..."
                  className="w-full rounded-full py-2 pl-4 pr-20 shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-purple/60 bg-white/80 border border-black/5"
                />
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-royal-purple text-white text-sm font-medium hover:opacity-90"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Right icons + Mobile menu */}
          <div className="col-span-3 flex items-center justify-end gap-4">
            <button className="relative hidden sm:inline-flex">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 3h18v4H3zM5 11h14v10H5z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-sanaa-orange text-white rounded-full text-xs px-1">
                2
              </span>
            </button>

            <button className="hidden sm:inline-flex w-10 h-10 rounded-full border border-black/10 bg-white/70 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M12 12a5 5 0 100-10 5 5 0 000 10zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen((s) => !s)}
              className="md:hidden text-gray-700 focus:outline-none"
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

      {/* Mobile dropdown remains the same */}
    </nav>
  );
}
