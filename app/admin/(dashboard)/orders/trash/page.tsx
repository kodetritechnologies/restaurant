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

function AdminOrdersTrashContent() {
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trash2 className="text-gold" />
            Orders Trash
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage deleted orders. You can restore them or delete them permanently.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-white rounded-lg flex items-center gap-2 text-sm transition-colors border border-foreground/10"
        >
          <RotateCcw size={16} />
          Back to Active Orders
        </Link>
      </div>

      <div className="bg-[#111] rounded-xl border border-foreground/10 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-foreground/10 flex justify-between items-center bg-foreground/5">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-foreground/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">
              Loading trash...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Trash2 className="w-12 h-12 mb-2 opacity-50" />
            <p>Trash is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-foreground/5 border-b border-foreground/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
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
    <Suspense fallback={<div className="p-8 text-center text-gold"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
      <AdminOrdersTrashContent />
    </Suspense>
  );
}
