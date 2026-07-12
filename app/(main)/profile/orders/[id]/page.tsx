"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Loader2, Package, Clock, MapPin, CreditCard, Banknote, ArrowLeft } from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  customerDetails?: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { getMethod } = BasicProvider();
  const { customer } = useCustomer();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currData = await getMethod("/api/currency?default=true");
        if (currData?.success && currData.currency) {
          setCurrency(currData.currency.symbol);
        }

        const orderData = await getMethod(`/api/customer/orders/${id}`);
        if (orderData && orderData.success) {
          setOrder(orderData.order);
        } else {
          toast.error("Failed to load order details");
          router.push("/profile/orders");
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

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

  const formatPaymentMethod = (method: string) => {
    if (!method) return "";
    switch (method) {
      case "cod": return "Cash on Delivery";
      case "payLater": return "Pay Later";
      case "razorpay": return "Razorpay";
      default: return method.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  if (!customer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex flex-col gap-4 mb-8">
        <Link 
          href="/profile/orders" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-gold transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </Link>
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Order Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {order ? `Order #${order._id.slice(-6).toUpperCase()}` : "Loading..."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="text-sm text-gold tracking-widest uppercase font-semibold animate-pulse">Loading Order...</p>
        </div>
      ) : !order ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-serif font-medium text-foreground mb-2">Order Not Found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
          <Link href="/profile/orders" className="text-gold hover:underline">Return to Orders</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-6 border border-foreground/5"
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
            </div>

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-foreground/5">
              {order.customerDetails && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold" /> 
                    Delivery Details
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{order.customerDetails.name}</p>
                    <p>{order.customerDetails.phone}</p>
                    <p>{order.customerDetails.address}</p>
                    <p>{order.customerDetails.city}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 bg-foreground/5 p-3 rounded-lg">
                    <span className="text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Delivery Type</span>
                    <p className="text-sm font-medium text-foreground capitalize">{order.deliveryType}</p>
                  </div>
                  <div className="space-y-1.5 bg-foreground/5 p-3 rounded-lg">
                    <span className="text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment Method</span>
                    <p className="text-sm font-medium text-foreground uppercase">{formatPaymentMethod(order.paymentMethod)}</p>
                  </div>
                </div>
                <div className="bg-foreground/5 p-3 rounded-lg space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Payment Status</span>
                  <p className={`text-sm font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6 pb-6 border-b border-foreground/5">
              <h4 className="text-sm font-semibold text-foreground mb-4">Order Items</h4>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-foreground/5 p-3 rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-foreground/10 shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <img src="/assets/no-image-food.jpg" alt="No image" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-base line-clamp-1">{item.name}</p>
                    {item.variantName && <p className="text-sm text-muted-foreground mt-0.5">{item.variantName}</p>}
                    <p className="text-sm text-gold font-medium mt-1">{currency}{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-foreground">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center justify-between w-full max-w-[250px] text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{currency}{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between w-full max-w-[250px] text-sm text-muted-foreground">
                <span>Delivery Fee</span>
                <span>{currency}{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between w-full max-w-[250px] text-lg font-bold text-gold pt-2 border-t border-foreground/10 mt-2">
                <span>Total Amount</span>
                <span>{currency}{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
