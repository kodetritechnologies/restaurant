"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2, Trash2, ShoppingBag, Search, RotateCcw } from "lucide-react";
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
    phone?: string;
    email?: string;
  };
  deliveryType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  items: { quantity: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ready: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  out_for_delivery: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

function OrdersTrashContent() {
  const { getMethod, patchMethod, deleteMethod } = BasicProvider();
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 450);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/orders?trash=true&page=${currentPage}&limit=${itemsPerPage}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;

      const data = await getMethod(url);
      if (data && data.success) {
        setOrders(data.orders);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch {
      toast.error("Failed to load trashed orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch]);

  const handleRestore = async (id: string) => {
    const data = await patchMethod(`/api/admin/orders/${id}`, { action: "restore" });
    if (data?.success) {
      toast.success("Order restored successfully");
      fetchOrders();
    } else {
      toast.error(data?.message || "Failed to restore order");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const result = await confirmDelete("This action cannot be undone. The order will be permanently deleted.");
    if (!result.isConfirmed) return;

    const data = await deleteMethod(`/api/admin/orders/${id}?force=true`);
    if (data?.success) {
      toast.success("Order permanently deleted");
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
            <Trash2 className="text-gold" />
            Orders Trash
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Soft-deleted orders. Restore or permanently delete them.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold font-semibold px-4 py-2 rounded-xl transition-all w-fit text-sm"
        >
          <ShoppingBag size={16} /> All Orders
        </Link>
      </div>

      <div className="glass p-6 rounded-2xl border border-foreground/10 min-h-[500px]">
        <div className="mb-6">
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
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-foreground/10 rounded-xl">
            <Trash2 className="w-12 h-12 mb-2 opacity-50" />
            <p>Trash is empty.</p>
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
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(order._id)}
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(order._id)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

export default function AdminOrdersTrashPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mb-2" /><p>Loading...</p></div>}>
      <OrdersTrashContent />
    </Suspense>
  );
}
