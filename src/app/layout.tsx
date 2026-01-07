import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GKPI Bandar Lampung",
  description: "Website resmi Gereja Kristen Protestan Indonesia (GKPI) Bandar Lampung. Temukan jadwal ibadah, warta jemaat, dan informasi kegiatan gereja.",
  keywords: ["GKPI", "Gereja", "Bandar Lampung", "Kristen", "Protestan", "Ibadah"],
  authors: [{ name: "GKPI Bandar Lampung" }],
  openGraph: {
    title: "GKPI Bandar Lampung",
    description: "Website resmi Gereja Kristen Protestan Indonesia (GKPI) Bandar Lampung",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

