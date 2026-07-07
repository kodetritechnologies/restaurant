"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCustomer } from "@/context/CustomerContext";
import { User, ShoppingBag, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BasicProvider from "@/utils/BasicProvider";
import { useState } from "react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { customer, isLoading, logout } = useCustomer();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push("/");
    }
  }, [isLoading, customer, router]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  const tabs = [
    { name: "My Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
    { name: "My Orders", href: "/profile/orders", icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="mb-10">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gradient-gold leading-none">
              Welcome, {customer.name || customer.email.split("@")[0]}
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
              Manage your account
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="glass rounded-3xl p-4 flex flex-col gap-2">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-gradient-gold text-primary-foreground shadow-gold"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </Link>
                );
              })}
              
              <div className="h-px bg-white/10 my-2 mx-2" />
              
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-red-400 hover:bg-red-400/10 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </aside>

            {/* Page Content */}
            <div className="glass rounded-3xl p-6 md:p-8 min-h-[500px]">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
