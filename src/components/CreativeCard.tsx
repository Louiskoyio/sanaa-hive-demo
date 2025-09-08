import Link from "next/link";
import { useState } from "react";

type CreativeCardProps = {
  stageName: string;
  category: string;
  verified?: boolean;          // default false
  profileUrl?: string;         // if provided, the CTA is a link
  onView?: () => void;         // click handler fallback
  ctaLabel?: string;           // default "View Profile"
  image?: string;              // NEW: optional profile/banner image
  imageAlt?: string;           // optional alt text (defaults to stageName)
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      {/* Top banner (same height as ProductCard image) */}
      <div className="relative w-full h-48 bg-white  flex items-center justify-center">
        {showImage ? (
          <>
            <img
              src={image as string}
              alt={imageAlt || stageName}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            {/* optional subtle overlay to keep badge legible on bright images */}
            <div className="absolute inset-0 bg-black/0" />
          </>
        ) : (
          <span className="text-white/95 text-5xl font-bold select-none">
            {initials(stageName)}
          </span>
        )}

        {/* Verified / Not Verified badge */}
        <span
          className={`absolute left-3 top-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow
            ${verified ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          {verified ? "Verified" : "Not Verified"}
        </span>
      </div>

      {/* Body (mirrors ProductCard spacing & typography) */}
      <div className="p-4 flex flex-col h-full">
        <h4 className="font-semibold text-sanaa-orange line-clamp-1">{stageName}</h4>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500 line-clamp-1">{category}</div>

          {profileUrl ? (
            <Link
              href={profileUrl}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-royal-purple text-white text-sm font-medium hover:bg-royal-purple/90 transition"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              onClick={onView}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-royal-purple text-white text-sm font-medium hover:bg-royal-purple/90 transition"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
