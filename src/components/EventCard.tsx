type EventCardProps = {
  title: string;
  date: string | Date;
  venue: string;
  description: string;
  image: string;
  price?: string;              // e.g. "Ksh. 1,000"
  ticketUrl?: string;          // if provided, CTA is a link
  onBuy?: () => void;          // fallback handler if no ticketUrl
  ctaLabel?: string;           // default: "Buy Ticket"
  badge?: string;              // e.g. "Sold Out" | "New" | "Hot"
};

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return typeof d === "string" ? d : date.toLocaleString();
  }
}

function badgeClasses(badge?: string) {
  if (!badge) return "";
  const b = badge.toLowerCase();
  if (b.includes("sold")) return "bg-gray-900 text-white";
  if (b.includes("new")) return "bg-emerald-500 text-white";
  if (b.includes("hot")) return "bg-rose-500 text-white";
  return "bg-black text-white";
}

export default function EventCard({
  title,
  date,
  venue,
  description,
  image,
  price,
  ticketUrl,
  onBuy,
  ctaLabel = "Buy Ticket",
  badge,
}: EventCardProps) {
  const isSoldOut = badge?.toLowerCase().includes("sold");

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Left: Image (uniform crop: max 750x350, object-cover) */}
        <div className="md:col-span-2 relative flex items-stretch justify-center">
          <div
            className="relative w-full max-w-[750px] max-h-[350px] overflow-hidden"
            style={{ aspectRatio: "15 / 7" }} // ~750x350 ratio
          >
            <img
              src={image}
              alt={title}
              width={750}
              height={350}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Badge */}
            {badge && (
              <span
                className={`absolute left-3 top-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow ${badgeClasses(
                  badge
                )}`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-3 p-4 md:p-6 flex flex-col h-full">
          {/* Title + Price row */}
          <div className="flex items-start justify-between gap-4">
            <h4 className="text-lg md:text-xl font-semibold text-sanaa-orange">
              {title}
            </h4>
            {price && (
              <div className="text-royal-purple font-bold whitespace-nowrap">
                {price}
              </div>
            )}
          </div>

          {/* Meta: Date + Venue */}
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {/* calendar icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 3v3M17 3v3M3 8h18M5 21h14a2 2 0 0 0 2-2V8H3v11a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* map pin icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>{venue}</span>
            </div>
          </div>

          {/* Description */}
          <p
            className="mt-3 text-gray-700"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>

          {/* CTA */}
          <div className="mt-5 flex items-center gap-3">
            {ticketUrl ? (
              <a
                href={isSoldOut ? undefined : ticketUrl}
                aria-disabled={isSoldOut}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition ${
                  isSoldOut
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-royal-purple text-white hover:bg-royal-purple/90"
                }`}
              >
                {isSoldOut ? "Sold Out" : ctaLabel}
              </a>
            ) : (
              <button
                onClick={isSoldOut ? undefined : onBuy}
                disabled={isSoldOut}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition ${
                  isSoldOut
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-royal-purple text-white hover:bg-royal-purple/90"
                }`}
              >
                {isSoldOut ? "Sold Out" : ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
