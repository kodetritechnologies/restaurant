import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Auréa — Fine Dining Restaurant & Cafe",
  description: "Auréa is a luxury fine dining restaurant offering world-class cuisine, award-winning chefs and an unforgettable ambiance. Reserve your table today.",
  openGraph: {
    title: "Auréa — Fine Dining Restaurant & Cafe",
    description: "Auréa is a luxury fine dining restaurant offering world-class cuisine, award-winning chefs and an unforgettable ambiance. Reserve your table today.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auréa — Fine Dining Restaurant & Cafe",
    description: "Auréa is a luxury fine dining restaurant offering world-class cuisine, award-winning chefs and an unforgettable ambiance. Reserve your table today.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${greatVibes.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
