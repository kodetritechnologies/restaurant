"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import CartDrawer from "@/components/CartDrawer";
import BasicProvider from "@/utils/BasicProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { getMethod } = BasicProvider();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getMethod("/api/settings");
        if (data && data.success) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load settings in MainLayout", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
      <Footer settings={settings} />
      <FloatingButtons settings={settings} />
      <CartDrawer />
    </div>
  );
}
