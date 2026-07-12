"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Loader2, Package, SearchX, Clock, MapPin, Map, CreditCard, DollarSign } from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";

interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  deliveryType: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const { getMethod } = BasicProvider();
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("$");
  const [paginationData, setPaginationData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currData = await getMethod("/api/currency?default=true");
        if (currData?.success && currData.currency) {
          setCurrency(currData.currency.symbol);
        }

        const ordersData = await getMethod(`/api/customer/orders?page=${page}`);
        if (ordersData && ordersData.success) {
          setOrders(ordersData.orders);
          setPaginationData(ordersData.pagination);
        } else {
          toast.error("Failed to load orders");
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "ready": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "out_for_delivery": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "delivered": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-foreground/10 text-muted-foreground border-foreground/20";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-emerald-400";
      case "failed": return "text-red-400";
      default: return "text-yellow-500";
    }
  };

  if (!customer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Order History</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and view your past orders.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="text-sm text-gold tracking-widest uppercase font-semibold animate-pulse">Loading Orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-serif font-medium text-foreground mb-2">No orders found</h3>
          <p className="text-muted-foreground max-w-sm">Looks like you haven't placed any orders yet. Go to the menu to order your first meal!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-6 border border-foreground/5 hover:border-gold/30 transition-all duration-300"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-foreground/5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground text-lg">Order #{order._id.slice(-6).toUpperCase()}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-gold">{currency}{order.totalAmount.toFixed(2)}</div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-foreground/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-foreground/5 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <img src="/assets/no-image-food.jpg" alt="No image" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm line-clamp-1">{item.name}</p>
                      {item.variantName && <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">{currency}{item.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Delivery Method</span>
                  <p className="text-sm text-foreground capitalize">{order.deliveryType}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment Method</span>
                  <p className="text-sm text-foreground uppercase">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Payment Status</span>
                  <p className={`text-sm font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Pagination */}
          {paginationData && <Pagination data={paginationData} />}
        </div>
      )}
    </motion.div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
