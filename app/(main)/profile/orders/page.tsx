"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Loader2, Package, SearchX, Clock, MapPin, Map, CreditCard, Banknote, Eye, Trash2 } from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import Link from "next/link";

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
  const { getMethod, deleteMethod } = BasicProvider();
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("");
  const [paginationData, setPaginationData] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    setDeletingId(orderId);
    try {
      const res = await deleteMethod(`/api/customer/orders/${orderId}`);
      if (res && res.success) {
        toast.success("Order deleted successfully");
        setOrders(orders.filter(order => order._id !== orderId));
      } else {
        toast.error(res?.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the order");
    } finally {
      setDeletingId(null);
    }
  };

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
          <div className="overflow-x-auto rounded-xl border border-foreground/10 bg-foreground/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/10 text-muted-foreground text-sm uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Order ID</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Total</th>
                  <th className="py-4 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-foreground">#{order._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gold">
                      {currency}{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/profile/orders/${order._id}`} 
                          title="View Details"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-foreground hover:text-gold hover:bg-gold/10 border border-foreground/10 hover:border-gold/30"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">View Details</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={deletingId === order._id}
                          title="Delete Order"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-foreground hover:text-red-500 hover:bg-red-500/10 border border-foreground/10 hover:border-red-500/30"
                        >
                          {deletingId === order._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span className="sr-only">Delete Order</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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
