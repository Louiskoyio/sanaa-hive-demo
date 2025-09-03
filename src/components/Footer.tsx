export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="mb-4">
          <span className="font-semibold text-white">Sanaa Hive</span> — empowering creatives
        </div>
        <div className="text-sm">© {new Date().getFullYear()} Sanaa Hive. All rights reserved.</div>
      </div>
    </footer>
  );
}
