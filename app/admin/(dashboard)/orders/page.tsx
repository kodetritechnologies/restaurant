"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye, ShoppingBag, Search, Filter, RotateCcw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import Pagination from "@/components/Pagination";
import { confirmDelete } from "@/utils/swal";
import { useSearchParams } from "next/navigation";

interface Order {
  _id: string;
  customerDetails: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    note?: string;
    tableNumber?: string;
  };
  deliveryType: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
  items: { quantity: number; price: number }[];
}

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

export default function AdminOrdersPage() {
  const { getMethod, deleteMethod } = BasicProvider();
  const searchParams = useSearchParams();

  const itemsPerPage = 10;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 450);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/orders?page=${currentPage}&limit=${itemsPerPage}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (paymentStatusFilter) url += `&paymentStatus=${paymentStatusFilter}`;

      const data = await getMethod(url);
      if (data && data.success) {
        setOrders(data.orders);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch, statusFilter, paymentStatusFilter]);

  const handleDelete = async (id: string) => {
    const result = await confirmDelete("This will move the order to trash.");
    if (!result.isConfirmed) return;

    const data = await deleteMethod(`/api/admin/orders/${id}`);
    if (data?.success) {
      toast.success("Order moved to trash");
      fetchOrders();
    } else {
      toast.error(data?.message || "Failed to delete order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="text-gold" />
            Orders Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all customer orders.
          </p>
        </div>
        <Link
          href="/admin/orders/trash"
          className="flex items-center gap-2 border border-foreground/10 hover:border-red-400/40 text-muted-foreground hover:text-red-400 font-semibold px-4 py-2 rounded-xl transition-all w-fit text-sm"
        >
          <Trash2 size={16} /> Trash
        </Link>
      </div>

      <div className="glass p-6 rounded-2xl border border-foreground/10 min-h-[500px]">
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface/50 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface/50 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface/50 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
              >
                <option value="">All Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-foreground/10 rounded-xl">
            <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/10 text-muted-foreground text-sm">
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Delivery</th>
                  <th className="py-3 px-4 font-medium">Items</th>
                  <th className="py-3 px-4 font-medium">Total</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium">Pay Method</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors group">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground text-sm">{order.customerDetails?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{order.customerDetails?.phone || order.customerDetails?.email || "—"}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] text-gold/80 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {order.deliveryType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border ${STATUS_COLORS[order.status] || ""}`}>
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border ${PAYMENT_COLORS[order.paymentStatus] || ""}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] text-foreground/80 bg-foreground/10 border border-foreground/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
                          title="View Order"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-all"
                          title="Move to Trash"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center pt-6 pb-2 gap-3">
            <Pagination data={{ currentPage, totalPages }} isAdmin={true} />
            <span className="text-xs text-muted-foreground">
              Showing {orders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} orders
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
