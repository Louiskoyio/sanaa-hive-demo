const categories = [
  { name: "Events", key: "events" },
  { name: "Art", key: "art" },
  { name: "Merchandise", key: "merchandise" },
  { name: "Creatives", key: "creatives" },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h3 className="text-2xl font-semibold mb-6 text-center">Browse by category</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((c) => (
          <div key={c.key} className="rounded-lg overflow-hidden shadow-sm bg-white">
            <img src={`/assets/categories/${c.key}.jpg`} alt={c.name} className="w-full h-40 object-cover" />
            <div className="p-4 text-center">
              <div className="font-medium text-gray-800">{c.name}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
