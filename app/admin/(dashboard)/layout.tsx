"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  Info,
  MessageSquare,
  Image,
  Users,
  HelpCircle,
  Star,
  ListTree,
  Package,
  ChevronDown,
  ChevronUp,
  User,
  Key,
  CircleDollarSign
} from "lucide-react";
import Cookies from "js-cookie";
import BasicProvider from "@/utils/BasicProvider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { getMethod } = BasicProvider();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }
      try {
        const data = await getMethod("/api/auth/me");
        if (data && data.success) {
          setAdminUser(data.admin);
          setCheckingAuth(false);
        } else {
          Cookies.remove("adminToken");
          router.push("/admin/login");
        }
      } catch (err) {
        Cookies.remove("adminToken");
        router.push("/admin/login");
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getMethod("/api/settings");
        if (data && data.success) {
          setShowBanner(data.settings.showBanner);
          setBannerText(data.settings.bannerText);
        }
      } catch (err) {
        console.error("Failed to load settings in layout", err);
      }
    };
    fetchSettings();
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("adminToken");
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { 
      label: "Products", 
      icon: Package,
      subItems: [
        { href: "/admin/products", label: "All Products" },
        { href: "/admin/products/create", label: "Create Product" },
        { href: "/admin/products/trash", label: "Trash" }
      ]
    },
    { href: "/admin/categories", label: "Categories", icon: ListTree },
    {
      label: "Customers",
      icon: User,
      subItems: [
        { href: "/admin/customers", label: "All Customers" },
        { href: "/admin/customers/trash", label: "Trash" },
      ],
    },
    { href: "/admin/bookings", label: "Reservations", icon: CalendarDays },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/gallery", label: "Gallery", icon: Image },
    { href: "/admin/chefs", label: "Chefs Team", icon: Users },
    { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    { href: "/admin/currency", label: "Currency", icon: CircleDollarSign },
    { href: "/admin/credentials", label: "Credentials", icon: Key },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <UtensilsCrossed className="h-10 w-10 text-gold animate-bounce mb-4" />
        <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">Loading Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background text-foreground flex flex-col lg:flex-row relative">
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-foreground/5 bg-surface/50 backdrop-blur-md p-6 justify-between z-30">
        <div className="flex flex-col gap-8 flex-1 overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold shadow-gold">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <span className="block font-serif text-lg font-bold tracking-wide text-gradient-gold">
                NEW UDIPI Restaurant
              </span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Restaurant Admin
              </span>
            </div>
          </div>

          <div className="glass p-4 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-full bg-gold/25 border border-gold/40 flex items-center justify-center font-bold text-gold shrink-0">
              {adminUser?.name[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{adminUser?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{adminUser?.email}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
            <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              if (item.subItems) {
                const isActive = item.subItems.some(sub => pathname === sub.href);
                const isOpen = openDropdowns.includes(item.label);
                
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-semibold transition-all ${isActive && !isOpen
                        ? "bg-gold/20 text-gold"
                        : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-1 pl-11 pr-2 py-1"
                        >
                          {item.subItems.map(subItem => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <button
                                key={subItem.href}
                                onClick={() => router.push(subItem.href)}
                                className={`w-full flex items-center px-4 py-2 rounded-full text-xs font-medium transition-all ${isSubActive
                                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                                  : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                                  }`}
                              >
                                {subItem.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              const isActive = item.exact
                ? pathname === item.href
                : item.href && pathname.startsWith(item.href) && pathname !== "/admin/login";
              return (
                <button
                  key={item.href || item.label}
                  onClick={() => item.href && router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all ${isActive
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                    }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            </nav>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-destructive-foreground hover:bg-destructive/10 transition-colors shrink-0 mt-4"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout Console</span>
        </button>
      </aside>

      <header className="lg:hidden flex items-center justify-between border-b border-foreground/5 bg-surface/50 backdrop-blur-md px-6 py-4 z-40">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-gold shadow-gold">
            <UtensilsCrossed className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <div>
            <span className="block font-serif text-sm font-bold tracking-wide text-gradient-gold">
              NEW UDIPI Restaurant
            </span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-gold"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-surface border-l border-foreground/5 p-6 flex flex-col justify-between z-50 lg:hidden"
            >
              <div className="flex flex-col gap-8 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-gradient-gold text-lg">Restaurant Admin Menu</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 text-gold"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="glass p-4 rounded-xl flex items-center gap-3 shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gold/25 border border-gold/40 flex items-center justify-center font-bold text-gold shrink-0">
                    {adminUser?.name[0] || "A"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{adminUser?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{adminUser?.email}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                  <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    
                    if (item.subItems) {
                      const isActive = item.subItems.some(sub => pathname === sub.href);
                      const isOpen = openDropdowns.includes(item.label);
                      
                      return (
                        <div key={item.label} className="space-y-1">
                          <button
                            onClick={() => toggleDropdown(item.label)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-semibold transition-all ${isActive && !isOpen
                              ? "bg-gold/20 text-gold"
                              : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-4.5 w-4.5 shrink-0" />
                              <span>{item.label}</span>
                            </div>
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-1 pl-11 pr-2 py-1"
                              >
                                {item.subItems.map(subItem => {
                                  const isSubActive = pathname === subItem.href;
                                  return (
                                    <button
                                      key={subItem.href}
                                      onClick={() => {
                                        router.push(subItem.href);
                                        setSidebarOpen(false);
                                      }}
                                      className={`w-full flex items-center px-4 py-2 rounded-full text-xs font-medium transition-all ${isSubActive
                                        ? "bg-gradient-gold text-primary-foreground shadow-gold"
                                        : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                                        }`}
                                    >
                                      {subItem.label}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    const isActive = item.exact
                      ? pathname === item.href
                      : item.href && pathname.startsWith(item.href) && pathname !== "/admin/login";
                    return (
                      <button
                        key={item.href || item.label}
                        onClick={() => {
                          if (item.href) router.push(item.href);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all ${isActive
                          ? "bg-gradient-gold text-primary-foreground shadow-gold"
                          : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                          }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  </nav>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-destructive-foreground hover:bg-destructive/10 transition-colors shrink-0 mt-4"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout Console</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-8">
        {showBanner && bannerText && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-gold p-4 text-primary-foreground font-semibold flex items-center justify-between shadow-gold shrink-0">
            <div className="flex items-center gap-2 pr-8">
              <Info className="h-4.5 w-4.5 shrink-0" />
              <p className="text-xs sm:text-sm tracking-wide leading-snug">
                {bannerText}
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:scale-110 transition-transform"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
