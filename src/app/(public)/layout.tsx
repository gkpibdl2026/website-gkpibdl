import { Navbar, Footer, BottomNav } from "@/components";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="main-content min-h-screen">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
