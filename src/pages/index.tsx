import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function Home() {
  const artAndMerch = [
    { title: "Abstract Canvas", price: "$120", image: "/assets/products/demo-art-1.png" },
    { title: "Sanaa Tee", price: "$25", image: "/assets/products/demo-merch-1.png" },
    { title: "Limited Print", price: "$40", image: "/assets/products/demo-art-2.png" },
    { title: "Handmade Tote", price: "$30", image: "/assets/products/demo-merch-2.png" },
  ];

  const topSelling = [
    { title: "Street Poster", price: "$18", image: "/assets/products/demo-art-3.png" },
    { title: "Logo Hoodie", price: "$60", image: "/assets/products/demo-merch-3.png" },
    { title: "Canvas Series", price: "$150", image: "/assets/products/demo-art-4.png" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSlider />

        <section className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-semibold mb-6">Art & Merch</h3>
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
      </main>

      <Footer />
    </div>
  );
}
