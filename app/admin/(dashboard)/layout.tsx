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
  Key,
  CircleDollarSign,
  ShoppingBag,
  Bell,
  CheckCheck,
  User
} from "lucide-react";
import Cookies from "js-cookie";
import BasicProvider from "@/utils/BasicProvider";
import socket from "@/utils/socket";
import toast from "react-hot-toast";

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      const { patchMethod } = BasicProvider();
      await patchMethod("/api/notifications", {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  useEffect(() => {
    const playNotificationSound = () => {
      try {
        const audio = new Audio('/notification.wav');
        let playCount = 0;
        
        const attemptPlay = () => {
          audio.play().catch(e => {
            if (e.name === "NotAllowedError") {
              toast("Browser blocked notification sound. Please click anywhere on the page to enable sounds.", {
                icon: "🔇",
                id: "audio-blocked-toast"
              });
            } else {
              console.error("Audio playback failed:", e);
            }
          });
        };

        audio.addEventListener('ended', () => {
          playCount++;
          if (playCount < 2) {
            setTimeout(() => {
              audio.currentTime = 0;
              attemptPlay();
            }, 500);
          }
        });
        
        attemptPlay();
      } catch (e) {
        console.error("Audio playback setup failed:", e);
      }
    };

    const handleWaiterCalled = (data: { _id?: string, message: string, timestamp?: string }) => {
      setNotifications(prev => [{
        _id: data._id || Math.random().toString(),
        message: data.message,
        isRead: false,
        createdAt: data.timestamp || new Date().toISOString()
      }, ...prev]);
      
      playNotificationSound();
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-[#1a0b0b] shadow-[var(--shadow-gold)] border border-gold/30 rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5 text-4xl">
                  🔔
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Waiter Called!
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    Table needs: <span className="font-bold text-gold">{data.message}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-red-900/30">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-400 hover:text-red-300 focus:outline-none transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ),
        { duration: 10000, position: "top-right" }
      );
    };

    socket.on("waiter_called", handleWaiterCalled);

    return () => {
      socket.off("waiter_called", handleWaiterCalled);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getMethod("/api/notifications");
        if (data && data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
  }, [pathname]);

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
    {
      label: "Orders",
      icon: ShoppingBag,
      subItems: [
        { href: "/admin/orders", label: "All Orders" },
        { href: "/admin/orders/trash", label: "Trash" },
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

      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col gap-8 relative">
        <div className="flex justify-end items-center -mb-4 z-40">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-foreground/70 hover:text-gold transition-colors bg-surface/50 rounded-full border border-foreground/5 backdrop-blur-md"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a0b0b] border border-gold/30 rounded-xl shadow-[var(--shadow-gold)] overflow-hidden z-50 flex flex-col max-h-[80vh]"
                >
                  <div className="p-4 border-b border-red-900/30 flex justify-between items-center bg-red-950/20">
                    <h3 className="font-serif font-bold text-gold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs flex items-center gap-1 text-foreground/60 hover:text-gold transition-colors"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-center text-foreground/50 py-8">No notifications yet</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif._id} className={`p-3 rounded-lg border ${notif.isRead ? 'bg-surface/30 border-foreground/5' : 'bg-red-950/20 border-red-900/30'} flex flex-col gap-1 transition-colors`}>
                          <div className="flex justify-between items-start">
                            <span className={`font-semibold text-sm ${notif.isRead ? 'text-foreground/70' : 'text-gold'}`}>Waiter Called</span>
                            <span className="text-[10px] text-foreground/40">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className={`text-sm ${notif.isRead ? 'text-foreground/50' : 'text-foreground/90'}`}>Table needs: <span className="font-bold">{notif.message}</span></p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

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
