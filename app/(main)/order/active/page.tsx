"use client";

import { useEffect, useState } from "react";
import BasicProvider from "@/utils/BasicProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Package, XCircle, ArrowLeft, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { confirmAction } from "@/utils/swal";

export default function ActiveOrdersPage() {
  const { getMethod, patchMethod } = BasicProvider();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [cancellationTimeLimit, setCancellationTimeLimit] = useState<number>(5);
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  useEffect(() => {
    fetchActiveOrders();
    fetchCurrency();
    fetchSettings();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getMethod("/api/settings");
      if (data && data.success && data.settings) {
        setCancellationTimeLimit(data.settings.cancellationTimeLimit ?? 5);
      }
    } catch (error) {}
  };

  const isCancellable = (order: any) => {
    if (order.status !== "pending") return false;
    if (cancellationTimeLimit === 0) return false;
    
    const orderTime = new Date(order.createdAt).getTime();
    const elapsedMinutes = (now - orderTime) / (1000 * 60);
    return elapsedMinutes <= cancellationTimeLimit;
  };

  const getRemainingTimeStr = (order: any) => {
    if (cancellationTimeLimit === 0) return "";
    const orderTime = new Date(order.createdAt).getTime();
    const remainingMs = (cancellationTimeLimit * 60 * 1000) - (now - orderTime);
    if (remainingMs <= 0) return "";
    
    const totalSeconds = Math.floor(remainingMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `(${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')})`;
  };

  const fetchCurrency = async () => {
    try {
      const data = await getMethod("/api/currency?default=true");
      if (data && data.success && data.currency) {
        setCurrencySymbol(data.currency.symbol);
      }
    } catch (error) {}
  };

  const fetchActiveOrders = async () => {
    setLoading(true);
    try {
      const data = await getMethod("/api/customer/orders?limit=20");
      if (data && data.success) {
        const active = data.orders.filter(
          (o: any) => o.status !== "delivered" && o.status !== "cancelled"
        );
        setOrders(active);
      }
    } catch (error) {
      toast.error("Failed to load active orders");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const result = await confirmAction({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order? This action cannot be undone.",
      confirmButtonText: "Yes, cancel it!",
    });
    if (!result.isConfirmed) return;
    setCancelling(orderId);
    try {
      const data = await patchMethod(`/api/customer/orders/${orderId}/cancel`, {});

      if (data && data.success) {
        toast.success("Order cancelled successfully");
        await fetchActiveOrders();
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <main className="flex-1 pt-32 pb-24 min-h-screen">
      <section className="px-5 md:px-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.push("/")}
            className="p-2.5 rounded-full border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gradient-gold leading-none">
              Active Orders
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
              Track or cancel your recent orders
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-gold" />
            <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 glass rounded-3xl"
          >
            <Package className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
              No Active Orders
            </h2>
            <p className="text-muted-foreground mb-8">
              You don't have any ongoing orders at the moment.
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="px-8 py-3 rounded-full bg-gold text-primary-foreground font-semibold text-sm hover:bg-gold/90 transition-colors"
            >
              Order Now
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        Order #{order._id.substring(order._id.length - 6)}
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gold/10 text-gold">
                          {order.status}
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {isCancellable(order) && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        disabled={cancelling === order._id}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {cancelling === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Cancel Order {getRemainingTimeStr(order)}
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-foreground/80">
                          {item.quantity}x {item.name || "Item"}
                        </span>
                        <span className="font-medium text-foreground">
                          {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-foreground/10 pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        Total Amount
                      </p>
                      <p className="font-serif text-xl font-bold text-gold">
                        {currencySymbol}{order.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        Type
                      </p>
                      <p className="font-semibold text-sm capitalize">
                        {order.deliveryType}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </main>
  );
}
