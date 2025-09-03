import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* padding so content clears the fixed navbar */}
      <div className="flex-1 pt-[var(--nav-height,64px)]">
        {children}
      </div>
      <Footer />
    </div>
  );
}
