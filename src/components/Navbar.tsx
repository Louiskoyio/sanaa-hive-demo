import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <div className="text-2xl font-extrabold text-royal-purple">Sanaa Hive</div>
            <nav className="hidden md:flex space-x-4 text-gray-700">
              <Link href="/">Home</Link>
              <Link href="/feed">Feed</Link>
              <Link href="/profile">Profile</Link>
            </nav>
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-xl">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search creatives..."
                  className="w-full border rounded-full py-2 px-4 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-purple"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-royal-purple text-white text-sm">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v4H3zM5 11h14v10H5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="absolute -top-2 -right-2 bg-sanaa-orange text-white rounded-full text-xs px-1">2</span>
            </button>

            <button className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
