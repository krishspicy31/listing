import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CulturaLite - Discover Cultural Events Near You",
  description: "Celebrate music, dance, and tradition — all in one place. Connect with your cultural heritage and discover amazing experiences happening in your city.",
  keywords: "cultural events, music, dance, festivals, Indian culture, events near me",
  authors: [{ name: "CulturaLite Team" }],
  openGraph: {
    title: "CulturaLite - Discover Cultural Events Near You",
    description: "Celebrate music, dance, and tradition — all in one place.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CulturaLite - Discover Cultural Events Near You",
    description: "Celebrate music, dance, and tradition — all in one place.",
  },

  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
