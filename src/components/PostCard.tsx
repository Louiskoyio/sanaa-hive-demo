import Link from "next/link";
import { useMemo, useState } from "react";

type PostCardProps = {
  id: string;
  authorName: string;
  authorSlug?: string;
  verified?: boolean;
  avatar?: string;               // header avatar (already has fallback)
  category?: string;             // e.g. "Art", "Music"
  postedAt: string | Date;
  content: string;
  image?: string;                // main post image (fallback to initials if missing/broken)
  imageAlt?: string;
  tags?: string[];
  likes?: number;
  comments?: number;
  initiallyLiked?: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function fmtDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function PostCard({
  id,
  authorName,
  authorSlug,
  verified,
  avatar,
  category,
  postedAt,
  content,
  image,
  imageAlt,
  tags = [],
  likes = 0,
  comments = 0,
  initiallyLiked = false,
}: PostCardProps) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [avatarError, setAvatarError] = useState(false);
  const [postImgError, setPostImgError] = useState(false);

  const showAvatar = Boolean(avatar) && !avatarError;
  const showPostImage = Boolean(image) && !postImgError;
  const authorHref = authorSlug ? `/creatives/${authorSlug}` : undefined;

  const shortContent = useMemo(() => content.trim(), [content]);

  function toggleLike() {
    setLiked((v) => !v);
    setLikeCount((n) => (liked ? Math.max(0, n - 1) : n + 1));
  }

  async function share() {
    const url =
      typeof window !== "undefined"
        ? window.location.origin + `/feed#${id}`
        : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: authorName, text: "Check this post on Sanaa Hive", url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      } else {
        alert(url);
      }
    } catch {/* noop */}
  }

  return (
    <article id={id} className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Avatar (image or initials) */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-royal-purple to-royal-purple-700 flex items-center justify-center text-white font-bold">
          {showAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar as string}
              alt={authorName}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span>{initials(authorName)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {authorHref ? (
              <Link href={authorHref} className="font-semibold text-gray-900 hover:underline truncate">
                {authorName}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900 truncate">{authorName}</span>
            )}
            {verified && (
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500 text-white">
                Verified
              </span>
            )}
            {category && (
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-700">
                {category}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">{fmtDate(postedAt)}</div>
        </div>
      </div>

      {/* Media (image OR initials fallback like CreativeCard) */}
      <div className="relative w-full overflow-hidden">
        {showPostImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image as string}
            alt={imageAlt || `Post by ${authorName}`}
            className="w-full h-72 object-cover"
            loading="lazy"
            onError={() => setPostImgError(true)}
          />
        ) : (
          <div className="w-full h-72 bg-gradient-to-br from-royal-purple to-royal-purple-700 flex items-center justify-center">
            <span className="text-white/95 text-6xl font-bold select-none">
              {initials(authorName)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p
          className="text-gray-800"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {shortContent}
        </p>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLike}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-black/10 transition ${
              liked ? "bg-sanaa-orange text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {/* heart */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor">
              <path d="M12 21s-7.5-4.7-9.5-8.7C.6 8.9 2.5 6 5.3 6c1.7 0 2.9 1 3.7 2 .8-1 2-2 3.7-2 2.8 0 4.7 2.9 2.8 6.3C19.5 16.3 12 21 12 21z" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-black/10 bg-white text-gray-700 hover:bg-gray-50">
            {/* comment */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5A8 8 0 1 1 21 12z" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium">{comments}</span>
          </button>

          <button
            onClick={share}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-royal-purple text-white hover:bg-royal-purple/90"
          >
            {/* share arrow */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" strokeWidth="1.5" />
              <path d="M16 8l-4-4-4 4" strokeWidth="1.5" />
              <path d="M12 4v12" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-semibold">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
