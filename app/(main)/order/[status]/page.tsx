"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderStatusPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const status = params.status as string;
  const orderId = searchParams.get("orderId");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getStatusContent = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-400" />,
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          glowColor: "bg-green-500/20",
          title: "Order Placed!",
          description: "Thank you for your order. We're preparing it now.",
          actionText: "Continue New Order",
          actionRoute: "/menu",
        };
      case "cancel":
        return {
          icon: <XCircle className="w-12 h-12 text-red-400" />,
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          glowColor: "bg-red-500/20",
          title: "Order Cancelled",
          description: "Your order process was cancelled.",
          actionText: "Try Again",
          actionRoute: "/checkout",
        };
      case "pending":
      default:
        return {
          icon: <Clock className="w-12 h-12 text-yellow-400" />,
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          glowColor: "bg-yellow-500/20",
          title: "Order Pending",
          description: "We are processing your order. Please wait.",
          actionText: "Check Status",
          actionRoute: "/profile/orders",
        };
    }
  };

  const content = getStatusContent();

  return (
    <main className="flex-1 flex items-center justify-center px-5 pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <div className="relative inline-block mb-8">
          <div className={`absolute inset-0 rounded-full ${content.glowColor} blur-2xl scale-150`} />
          <div className={`relative w-24 h-24 rounded-full ${content.bgColor} border ${content.borderColor} flex items-center justify-center mx-auto`}>
            {content.icon}
          </div>
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
          {content.title}
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          {content.description}
        </p>
        {orderId ? (
          <p className="text-sm text-foreground/60 mb-10 bg-foreground/5 py-2 rounded-xl inline-block px-4 border border-foreground/5">
            Order ID: <span className="font-mono text-gold">{orderId}</span>
          </p>
        ) : (
          <div className="mb-10"></div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={() => router.push(content.actionRoute)}
            className="px-8 py-3 rounded-full bg-gold text-primary-foreground font-semibold text-sm hover:bg-gold/90 transition-colors"
          >
            {content.actionText}
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 rounded-full border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold font-semibold text-sm transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </main>
  );
}
