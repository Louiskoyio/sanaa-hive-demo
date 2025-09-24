// components/CreativeCard.tsx
import Link from "next/link";
import { useState } from "react";

type CreativeCardProps = {
  stageName: string;
  category: string;
  verified?: boolean;
  profileUrl?: string;
  onView?: () => void;
  ctaLabel?: string;
  image?: string;
  imageAlt?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function CreativeCard({
  stageName,
  category,
  verified = false,
  profileUrl,
  onView,
  ctaLabel = "View Profile",
  image,
  imageAlt,
}: CreativeCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(image) && !imgError;

  return (
    /* Thicker white bezel (no dark ring) */
    <div className="rounded-3xl bg-white p-3 shadow-2xl">
      {/* Inner card */}
      <div className="group relative overflow-hidden rounded-[1.35rem] bg-zinc-900/60">
        {/* Image / fallback */}
        <div className="relative h-80 w-full md:h-96">
          {showImage ? (
            <img
              src={image as string}
              alt={imageAlt || stageName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-700">
              <span className="select-none text-6xl font-bold text-white/90">
                {initials(stageName)}
              </span>
            </div>
          )}

          {/* Verified chip */}
          {verified && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-royal-purple/90 px-2 py-1 shadow">
              <img src="/verified-badge.png" alt="Verified" className="h-4 w-4" />
              <span className="text-xs font-semibold text-white">Verified</span>
            </div>
          )}

          {/* Blackish blur/gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/80 via-white/40 to-transparent backdrop-blur-sm" />

          {/* Content + CTA */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <h4 className="truncate text-xl font-bold text-black drop-shadow-sm">
                {stageName}
              </h4>
              <p className="truncate text-sm text-black/80">{category}</p>
            </div>

            {profileUrl ? (
              <Link
                href={profileUrl}
                className="shrink-0 rounded-full bg-sanaa-orange px-4 py-2 text-sm font-medium text-white shadow hover:bg-sanaa-orange/80"
              >
                {ctaLabel}
              </Link>
            ) : (
              <button
                onClick={onView}
                className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-zinc-100"
              >
                {ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
