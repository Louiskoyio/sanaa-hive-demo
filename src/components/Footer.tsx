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
                className="w-full rounded-full bg-black text-white font-semibold py-3 hover:bg-gray-100 hover:text-black transition"
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
            <div className="flex items-center gap-2 text-gray-700">
              <a href="https://x.com/yourhandle" aria-label="Twitter/X" className="p-2">
                <img src="/assets/footer/x.png" alt="Twitter/X" className="h-5 w-auto md:h-6" />
              </a>
              <a href="https://facebook.com/yourpage" aria-label="Facebook" className="p-2">
                <img src="/assets/footer/facebook.png" alt="Facebook" className="h-5 w-auto md:h-6" />
              </a>
              <a href="https://instagram.com/yourhandle" aria-label="Instagram" className="p-2">
                <img src="/assets/footer/instagram.png" alt="Instagram" className="h-5 w-auto md:h-6" />
              </a>
              <a href="https://pinterest.com/yourhandle" aria-label="Pinterest" className="p-2">
                <img src="/assets/footer/tik-tok.png" alt="Tik-tok" className="h-5 w-auto md:h-6" />
              </a>
            </div>
          </div>

          {/* columns */}
          <FooterCol  title="COMPANY" links={[
            ["About", "/about"],
            ["Contact Us", "/contact-us"],
          ]} />
          <FooterCol title="LINKS" links={[
            ["Creatives", "/creatives"],
            ["Events", "/events"],
            ["Terms & Conditions", "/terms"],
            ["Privacy Policy", "/privacy"],
          ]} />
          <FooterCol title="FAQ" links={[
            ["Account", "/account"],
            ["Register as a creative", "/signup"],
            ["Buy Event Tickets", "/events"],
          ]} />
        </div>

        {/* bottom bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white text-sm text-white-600">
            Sanaa Hive © {new Date().getFullYear()}, All Rights Reserved
          </p>

          {/* payment icons (simple badges; swap with real logos if you have them) */}
        <div className="flex items-center gap-3">
          <img src="/assets/footer/visa.png" alt="Visa" className="h-6 w-auto" />
          <img src="/assets/footer/mastercard.png" alt="Mastercard" className="h-6 w-auto" />
          <img src="/assets/footer/mpesa.png" alt="PayPal" className="h-6 w-auto" />
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
      <h4 className="text-sm font-semibold tracking-wider text-white mb-3">{title}</h4>
      <ul className="space-y-2 text-white">
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
