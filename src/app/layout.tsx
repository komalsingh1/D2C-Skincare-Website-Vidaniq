import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SkinQuizModal } from "@/components/quiz/SkinQuizModal";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { FirstVisitProvider } from "@/components/providers/FirstVisitProvider";

export const metadata: Metadata = {
  title: "Vidaniq — Organic Skincare, Rooted in Nature",
  description:
    "Science-backed, Ayurvedic-inspired skincare made with 100% natural actives. Dermatologist tested. Cruelty-free. Find your personalized routine.",
  keywords: [
    "organic skincare",
    "natural skincare",
    "ayurvedic skincare",
    "clean beauty India",
    "vidaniq",
  ],
  openGraph: {
    title: "Vidaniq — Organic Skincare, Rooted in Nature",
    description:
      "Science-backed, Ayurvedic-inspired skincare. 100% natural actives.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <SkinQuizModal />
        <CartSidebar />
        <FirstVisitProvider />
      </body>
    </html>
  );
}
