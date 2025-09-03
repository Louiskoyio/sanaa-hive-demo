// components/Footer.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to your newsletter endpoint
    // e.g., await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
  };

  return (
    <footer className="bg-[#d13841] pt-10">
      {/* Newsletter banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-royal-purple text-white rounded-3xl p-6 md:p-10 shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
              STAY UP TO DATE ABOUT
              <br className="hidden md:block" /> OUR LATEST NEWS AND EVENTS
            </h3>

            <form onSubmit={onSubscribe} className="w-full md:max-w-md space-y-3">
              {/* email input */}
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {/* mail icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-full bg-white text-black placeholder-gray-500 pl-10 pr-4 py-3 outline-none ring-0 focus:ring-2 focus:ring-black/30"
                />
              </div>

              {/* subscribe button */}
              <button
                type="submit"
                className="w-full rounded-full bg-white text-black font-semibold py-3 hover:bg-gray-100 transition"
              >
                Subscribe to Newsletter
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* link grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid text-white grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-black/10">
          {/* brand + blurb */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-white text-2xl font-extrabold tracking-tight">SANAA HIVE</span>
            </Link>
            <p className="text-sm text-white text-white-600">
              We connect creatives with brands and fans—discover, hire, and grow together.
            </p>
            <div className="flex items-center gap-3 text-gray-700">
              {/* socials */}
              <a href="#" aria-label="Twitter" className="p-2 rounded-full border hover:bg-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 5.9c-.7.3-1.4.5-2.2.6.8-.5 1.3-1.2 1.6-2-.8.5-1.7.8-2.6 1A3.9 3.9 0 0 0 12 8.4c0 .3 0 .5.1.8A11 11 0 0 1 3 5.2a4 4 0 0 0 .6 5.2c-.6 0-1.2-.2-1.7-.5V10a3.9 3.9 0 0 0 3.1 3.8c-.5.2-1 .2-1.6.1a4 4 0 0 0 3.7 2.8A7.8 7.8 0 0 1 2 18.6a11 11 0 0 0 6 1.8c7.2 0 11.2-6 11.2-11.2v-.5c.8-.6 1.4-1.3 1.8-2.1z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-full border hover:bg-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 22v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-full border hover:bg-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
              </a>
              <a href="#" aria-label="Pinterest" className="p-2 rounded-full border hover:bg-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-3.5 19.4c-.1-1-.2-2.4 0-3.4l1.3-5.6s-.3-.7-.3-1.7c0-1.6.9-2.9 2.1-2.9 1 0 1.5.7 1.5 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2.1 0 3.7-2.2 3.7-5.4 0-2.8-2-4.8-4.9-4.8-3.3 0-5.2 2.5-5.2 5.1 0 1 .4 2.1 1 2.7.1.1.1.1 0 .3l-.4 1.5c0 .2-.1.3-.2.2-1.4-.7-2.2-2.6-2.2-4.2 0-3.4 2.4-6.5 7-6.5 3.7 0 6.6 2.6 6.6 6.1 0 3.7-2.3 6.7-5.6 6.7-1.1 0-2.2-.6-2.5-1.3l-.7 2.7c-.3 1.1-1 2.5-1.5 3.3A10 10 0 1 0 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* columns */}
          <FooterCol  title="COMPANY" links={[
            ["About", "/about"],
            ["Features", "/features"],
            ["Works", "/works"],
            ["Career", "/careers"],
          ]} />
          <FooterCol title="HELP" links={[
            ["Customer Support", "/support"],
            ["Delivery Details", "/delivery"],
            ["Terms & Conditions", "/terms"],
            ["Privacy Policy", "/privacy"],
          ]} />
          <FooterCol title="FAQ" links={[
            ["Account", "/account"],
            ["Manage Deliveries", "/deliveries"],
            ["Orders", "/orders"],
            ["Payments", "/payments"],
          ]} />
          <FooterCol title="RESOURCES" links={[
            ["Free eBooks", "/ebooks"],
            ["Development Tutorial", "/tutorials"],
            ["How-to • Blog", "/blog"],
            ["YouTube Playlist", "/youtube"],
          ]} />
        </div>

        {/* bottom bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-sm text-white-600">
            Sanaa Hive © {new Date().getFullYear()}, All Rights Reserved
          </p>

          {/* payment icons (simple badges; swap with real logos if you have them) */}
          <div className="flex items-center gap-2">
            {["VISA", "Mastercard", "PayPal", "Apple Pay", "Google Pay"].map((p) => (
              <span
                key={p}
                className="text-xs px-2.5 py-1 rounded-md bg-white border border-black/10"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold tracking-wider text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2 text-gray-700">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
