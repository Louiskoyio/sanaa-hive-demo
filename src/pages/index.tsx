// pages/index.tsx
import Page from "@/components/Page";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import CreativeCard from "@/components/CreativeCard";

export default function Home() {
  const creatives = [
      {stageName: "Mint Glint Studios", category: "Studio", verified: true, profileUrl: "/creatives/mint-glint-studios", image: "/assets/creatives/mint-glint.png",},
      {stageName: "Kito Wave", category: "DJ • Afro House", verified: true, profileUrl: "/creatives/kito-wave", image: "/assets/creatives/kito-wave.jpg",},
      {stageName: "Mara Collective",category: "Photography",verified: true, profileUrl: "/creatives/mara-collective",image: "/assets/creatives/mara-collective.jpg",},
      {stageName: "Nairobi Threads",category: "Fashion • Streetwear", verified: false, profileUrl: "/creatives/nairobi-threads",image: "/assets/creatives/nairobi-threads.webp",
  },]

  const artAndMerch = [
    { title: "Abstract Canvas", price: "KES 1 200", image: "/assets/merch/1.jpg" },
    { title: "Sanaa Tee", price: "KES 1 000", image: "/assets/merch/2.jpg" },
    { title: "Limited Print", price: "KES 1 500", image: "/assets/merch/1.webp" },
    { title: "Handmade Tote", price: "KES 800", image: "/assets/merch/4.jpg" },
  ];

  const topSelling = [
    { title: "Street Poster", price: "KES 18 000", image: "/assets/street-poster.jpg" },
    { title: "Logo Hoodie", price: "KES 2 000", image: "/assets/branded-hoodie.jpg" },
    { title: "Canvas Series", price: "KES 1 500", image: "/assets/canvas-series.jpg" },
  ];

  return (
    <Page>
      <HeroSlider />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-semibold mb-6">Creatives</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {creatives.map((p) => (
            <CreativeCard key={p.stageName} {...p} />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-semibold mb-6">Art &amp; Merch</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {artAndMerch.map((p) => (
            <ProductCard key={p.title} {...p} />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 bg-gray-50">
        <h3 className="text-2xl font-semibold mb-6">Top Selling</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topSelling.map((p) => (
            <ProductCard key={p.title} {...p} />
          ))}
        </div>
      </section>

      <CategoryGrid />
    </Page>
  );
}
