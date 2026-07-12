import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CustomerProvider } from "@/context/CustomerContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
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
  title: "NEW UDIPI Restaurant",
  description: "NEW UDIPI Restaurant offers authentic South Indian & Chinese cuisine. Reserve your table today.",
  openGraph: {
    title: "NEW UDIPI Restaurant",
    description: "NEW UDIPI Restaurant offers authentic South Indian & Chinese cuisine. Reserve your table today.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEW UDIPI Restaurant",
    description: "NEW UDIPI Restaurant offers authentic South Indian & Chinese cuisine. Reserve your table today.",
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
        <CustomerProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </CustomerProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-elegant)",
              borderRadius: "1rem",
              padding: "16px 20px",
              fontSize: "0.95rem",
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: "var(--gold)",
                secondary: "var(--surface)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--destructive)",
                secondary: "var(--surface)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
