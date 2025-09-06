// components/Layout.tsx
import Navbar, { SessionUser } from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Layout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      {/* padding so content clears the fixed navbar */}
      <div className="flex-1 pt-[var(--nav-height,64px)]">
        {children}
      </div>
      <Footer />
    </div>
  );
}
