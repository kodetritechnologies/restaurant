"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, User, Search, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import BasicProvider from "@/utils/BasicProvider";

interface CustomerItem {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: string;
  deleted_at: string;
}

export default function CustomersTrashPage() {
  const { getMethod, deleteMethod } = BasicProvider();

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const url = search
        ? `/api/admin/customers/trash?search=${encodeURIComponent(search)}`
        : "/api/admin/customers/trash";
      const data = await getMethod(url);
      if (data && data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      toast.error("Failed to load trashed customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch("/api/admin/customers/trash", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (data && data.success) {
        toast.success(data.message);
        fetchCustomers();
      } else {
        toast.error(data?.message || "Failed to restore customer");
      }
    } catch (error) {
      toast.error("An error occurred while restoring");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Permanently Delete?",
      text: "This action cannot be undone. The customer will be lost forever.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--destructive)",
      cancelButtonColor: "var(--muted)",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const data = await deleteMethod(`/api/admin/customers/trash?id=${id}`);
        if (data && data.success) {
          toast.success(data.message);
          fetchCustomers();
        } else {
          toast.error(data?.message || "Failed to permanently delete customer");
        }
      } catch (error) {
        toast.error("An error occurred while deleting");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trash2 className="text-gold" />
            Trash
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View soft-deleted customers.
          </p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 min-h-[500px]">
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCustomers()}
              className="w-full pl-9 pr-4 py-2 bg-surface/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
            <User className="w-12 h-12 mb-2 opacity-50" />
            <p>No trashed customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground text-sm">
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Phone</th>
                  <th className="py-3 px-4 font-medium">Joined</th>
                  <th className="py-3 px-4 font-medium">Deleted On</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 flex items-center justify-center bg-white/5 font-bold text-gold text-sm">
                          {customer.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {customer.name || (
                              <span className="italic text-muted-foreground text-xs">No Name</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {customer.phone || (
                        <span className="italic opacity-50 text-xs">Not Provided</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(customer.deleted_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => handleRestore(customer._id)}
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(customer._id)}
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
      </div>
    </div>
  );
}
