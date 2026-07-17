"use client";

import { useEffect, useState } from "react";
import CallWaiterModal from "./CallWaiterModal";
import { ClipboardList } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import BasicProvider from "@/utils/BasicProvider";
import Cookies from "js-cookie";

interface FloatingButtonsProps {
  settings?: {
    shopPhone?: string;
    whatsappNumber?: string;
  } | null;
}

export default function FloatingButtons({ settings }: FloatingButtonsProps) {
  const [showTop, setShowTop] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [hasActiveOrders, setHasActiveOrders] = useState(false);
  const [hasTableNumber, setHasTableNumber] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { getMethod } = BasicProvider();

  useEffect(() => {
    if (Cookies.get("scannedTableNumber")) {
      setHasTableNumber(true);
    }
  }, [pathname]);

  useEffect(() => {
    const checkActiveOrders = async () => {
      const data = await getMethod("/api/customer/orders?limit=10");
      if (data && data.success && data.orders) {
        const active = data.orders.filter(
          (o: any) => o.status !== "delivered" && o.status !== "cancelled"
        );
        setHasActiveOrders(active.length > 0);
      }
    };
    
    // Only check if not on admin routes
    if (!pathname?.startsWith("/admin")) {
      checkActiveOrders();
    }
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rawPhone = settings?.shopPhone;
  const rawWhatsapp = settings?.whatsappNumber;
  
  const cleanedPhone = rawPhone?.replace(/\D/g, "");
  const cleanedWhatsapp = rawWhatsapp?.replace(/\D/g, "");

  const whatsappUrl = `https://wa.me/${cleanedWhatsapp}`;
  const telUrl = `tel:+${cleanedPhone}`;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {pathname === "/" && (
          <>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-12 w-12 place-items-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M20 3.5A11.5 11.5 0 0 0 3.6 19.9L2 22l2.2-1.6A11.5 11.5 0 1 0 20 3.5Zm-8 19.2a9.5 9.5 0 0 1-4.9-1.3l-.3-.2-2.7 1 .8-2.7-.2-.3A9.5 9.5 0 1 1 12 21.7Zm5.4-7.2c-.3-.2-1.7-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.1-.7 0a7.6 7.6 0 0 1-3.7-3.3c-.3-.5.3-.5.8-1.5a.5.5 0 0 0 0-.5c-.1-.2-.7-1.6-.9-2.2s-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6c0 1.5 1.1 3 1.2 3.2s2.2 3.4 5.4 4.7a6 6 0 0 0 2.7.6 3.2 3.2 0 0 0 2.1-1 2.6 2.6 0 0 0 .5-1.5c-.1-.2-.3-.3-.6-.4Z" />
              </svg>
            </a>
            <a
              href={telUrl}
              aria-label="Call"
              className="grid h-12 w-12 place-items-center rounded-full bg-gold text-black shadow-lg transition-transform hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M20 15.5a12.4 12.4 0 0 1-3.9-.6 1 1 0 0 0-1 .3l-2.2 2.2a15 15 0 0 1-6.6-6.6l2.2-2.2a1 1 0 0 0 .3-1A12.4 12.4 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1 17 17 0 0 0 17 17 1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1Z" />
              </svg>
            </a>
          </>
        )}
        {showTop && (
          <button
            aria-label="Back to top"
            onClick={scrollToTop}
            className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-background/80 text-gold backdrop-blur transition-transform hover:scale-110"
          >
            ↑
          </button>
        )}
      </div>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 z-40 flex flex-col gap-3 items-center md:items-start">
        {hasActiveOrders && pathname === "/" && (
          <button
            onClick={() => router.push("/order/active")}
            className="rounded-full bg-background/90 border border-gold/40 px-4 py-2.5 text-sm font-semibold text-gold shadow-lg backdrop-blur flex items-center gap-2 hover:bg-gold hover:text-primary-foreground transition-colors whitespace-nowrap"
          >
            <ClipboardList className="w-4 h-4" /> Check Order Status
          </button>
        )}
        {hasTableNumber && pathname === "/" && (
          <button
            onClick={() => setIsWaiterModalOpen(true)}
            className="rounded-full bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] flex items-center gap-2"
          >
            <span>🔔</span> Call Waiter
          </button>
        )}
      </div>

      {hasTableNumber && (
        <CallWaiterModal 
          isOpen={isWaiterModalOpen} 
          onClose={() => setIsWaiterModalOpen(false)} 
        />
      )}
    </>
  );
}
