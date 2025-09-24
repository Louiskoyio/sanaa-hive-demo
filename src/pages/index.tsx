// pages/index.tsx
import Page from "@/components/Page";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import CreativeCard from "@/components/CreativeCard";

export default function Home() {
  const creatives = [
    { stageName: "Mint Glint Studios", category: "Studio", verified: true, profileUrl: "/creatives/mint-glint-studios", image: "/assets/creatives/mint-glint.png" },
    { stageName: "Kito Wave", category: "DJ • Afro House", verified: true, profileUrl: "/creatives/kito-wave", image: "/assets/creatives/kito-wave.jpg" },
    { stageName: "Mara Collective", category: "Photography", verified: true, profileUrl: "/creatives/mara-collective", image: "/assets/creatives/mara-collective.jpg" },
    { stageName: "Nairobi Threads", category: "Fashion • Streetwear", verified: false, profileUrl: "/creatives/nairobi-threads", image: "/assets/creatives/nairobi-threads.webp" },
  ];

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

 
    </Page>
  );
}
