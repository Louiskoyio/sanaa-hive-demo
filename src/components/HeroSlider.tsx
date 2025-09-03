import { useEffect, useState } from "react";

type Slide = {
  id: number;
  image: string; // path under /assets
  title: string;
  details: string;
};

const slides: Slide[] = [
  { id: 1, image: "/assets/highlighted-events/highlighted-event-1.jpg", title: "Open Mic Night", details: "Sat, 18 Oct — Groove Lounge" },
  { id: 2, image: "/assets/highlighted-events/highlighted-event-2.jpg", title: "Art Auction", details: "Fri, 24 Oct — Central Gallery" },
  { id: 3, image: "/assets/highlighted-events/highlighted-event-3.jpg", title: "Creative Expo", details: "Sun, 02 Nov — Hall A" },
  { id: 4, image: "/assets/highlighted-events/highlighted-event-4.webp", title: "Street Fashion", details: "Sat, 08 Nov — Plaza" },
  { id: 5, image: "/assets/highlighted-events/highlighted-event-5.png", title: "Sanaa Talent Show", details: "Fri, 21 Nov — Riverside" },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[520px] md:h-[620px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          style={{
            backgroundImage: `url(${s.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
       

          <div className="relative max-w-6xl mx-auto h-full px-6 lg:px-8 flex items-center">
            <div className="max-w-xl bg-white/80 p-6 rounded-md shadow-md">
              <h2 className="text-3xl md:text-4xl font-bold text-royal-purple mb-2">{s.title}</h2>
              <p className="text-gray-700 mb-4">{s.details}</p>
              <button className="px-4 py-2 rounded-md bg-sanaa-orange text-white">Buy Ticket</button>
            </div>
          </div>
        </div>
      ))}

      {/* simple dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-royal-purple" : "bg-gray-300"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
