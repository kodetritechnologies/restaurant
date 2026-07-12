"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, ShoppingBag, CheckCircle, XCircle, Clock, Truck, ChefHat, PackageCheck } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import { useParams, useRouter } from "next/navigation";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    featuredImage?: string;
    regularPrice?: number;
    salePrice?: number;
  } | null;
  variantId: {
    _id: string;
    variantName: string;
    galleryImages?: string[];
    regularPrice?: number;
    salePrice?: number;
  } | null;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerDetails: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    tableNumber?: string;
    note?: string;
  };
  deliveryType: string;
  paymentMethod: string;
  paymentMode?: string;
  paymentStatus: string;
  transactionId?: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-400" },
  { value: "processing", label: "Processing", icon: ChefHat, color: "text-blue-400" },
  { value: "ready", label: "Ready", icon: PackageCheck, color: "text-cyan-400" },
  { value: "out_for_delivery", label: "Out for Delivery", icon: Truck, color: "text-purple-400" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, color: "text-green-400" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-400" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ready: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  out_for_delivery: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  paid: "text-green-400 bg-green-400/10 border-green-400/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getMethod, patchMethod } = BasicProvider();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const data = await getMethod(`/api/admin/orders/${id}`);
      if (data?.success) {
        setOrder(data.order);
      } else {
        toast.error("Order not found");
      }
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const data = await patchMethod(`/api/admin/orders/${id}`, { status });
      if (data?.success) {
        toast.success("Order status updated");
        setOrder((prev) => prev ? { ...prev, status } : prev);
      } else {
        toast.error(data?.message || "Failed to update status");
      }
    } catch {
      toast.error("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const data = await patchMethod(`/api/admin/orders/${id}`, { paymentStatus });
      if (data?.success) {
        toast.success("Payment status updated");
        setOrder((prev) => prev ? { ...prev, paymentStatus } : prev);
      } else {
        toast.error(data?.message || "Failed to update payment status");
      }
    } catch {
      toast.error("Error updating payment status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground gap-4">
        <ShoppingBag className="w-12 h-12 opacity-40" />
        <p>Order not found.</p>
        <Link href="/admin/orders" className="text-gold text-sm hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/orders")}
          className="p-2 rounded-xl border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="text-gold" />
            Order Details
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">#{order._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="glass p-6 rounded-2xl border border-foreground/10">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingBag size={16} className="text-gold" /> Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => {
                const product = item.productId;
                const variant = item.variantId;
                const productName = product?.name || "Unknown Product";
                const variantName = variant?.variantName || null;
                const image = variant?.galleryImages?.[0] || product?.featuredImage || null;

                return (
                <div key={i} className="flex items-center justify-between py-3 border-b border-foreground/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {image ? (
                        <img src={image} alt={productName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ShoppingBag size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{productName}</p>
                      {variantName && (
                        <p className="text-xs text-muted-foreground">{variantName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                );
              })}
            </div>
            <div className="pt-4 space-y-2 border-t border-foreground/10 mt-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-foreground border-t border-foreground/10 pt-2">
                <span>Total</span>
                <span className="text-gold">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="glass p-6 rounded-2xl border border-foreground/10">
            <h2 className="font-semibold text-foreground mb-4">Customer Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: "Name", value: order.customerDetails?.name },
                { label: "Phone", value: order.customerDetails?.phone },
                { label: "Email", value: order.customerDetails?.email },
                { label: "City", value: order.customerDetails?.city },
                { label: "Address", value: order.customerDetails?.address },
                { label: "Table No.", value: order.customerDetails?.tableNumber },
                { label: "Note", value: order.customerDetails?.note },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label}>
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="text-foreground font-medium">{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </div>
        </div>

        {/* Right: Status & Payment */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="glass p-6 rounded-2xl border border-foreground/10 space-y-4">
            <h2 className="font-semibold text-foreground">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Type</span>
                <span className="text-gold font-medium capitalize">{order.deliveryType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              {order.transactionId && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs text-gold">{order.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Order Status Control */}
          <div className="glass p-6 rounded-2xl border border-foreground/10 space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              Order Status
              {updating && <Loader2 size={14} className="animate-spin text-gold" />}
            </h2>
            <div className="space-y-2">
              {ORDER_STATUSES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  disabled={updating || order.status === value}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    order.status === value
                      ? `${STATUS_COLORS[value]} border`
                      : "border-foreground/10 text-muted-foreground hover:border-gold/30 hover:text-gold"
                  }`}
                >
                  <Icon size={14} className={order.status === value ? color : ""} />
                  {label}
                  {order.status === value && <span className="ml-auto text-[10px] opacity-60">Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status Control */}
          <div className="glass p-6 rounded-2xl border border-foreground/10 space-y-3">
            <h2 className="font-semibold text-foreground">Payment Status</h2>
            <div className="flex flex-col gap-2">
              {(["pending", "paid", "failed"] as const).map((ps) => (
                <button
                  key={ps}
                  onClick={() => handlePaymentStatusChange(ps)}
                  disabled={updating || order.paymentStatus === ps}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    order.paymentStatus === ps
                      ? `${PAYMENT_COLORS[ps]} border`
                      : "border-foreground/10 text-muted-foreground hover:border-gold/30 hover:text-gold"
                  }`}
                >
                  <span className="capitalize">{ps}</span>
                  {order.paymentStatus === ps && <span className="ml-auto text-[10px] opacity-60">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
