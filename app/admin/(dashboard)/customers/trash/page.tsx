"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, User, Search, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import { confirmDelete } from "@/utils/swal";

interface CustomerItem {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: string;
  deleted_at: string;
}

export default function CustomersTrashPage() {
  const { getMethod, deleteMethod, patchMethod } = BasicProvider();

  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 10;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async (searchValue = "") => {
    try {
      setLoading(true);
      const url = searchValue
        ? `/api/admin/customers/trash?search=${encodeURIComponent(searchValue)}&page=${currentPage}&limit=${itemsPerPage}`
        : `/api/admin/customers/trash?page=${currentPage}&limit=${itemsPerPage}`;
      const data = await getMethod(url);
      if (data && data.success) {
        setCustomers(data.customers);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.customers.length);
      }
    } catch (error) {
      toast.error("Failed to load trashed customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchTerm);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchTerm);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    fetchCustomers("");
  };

  const handleRestore = async (id: string) => {
    try {
      const data = await patchMethod("/api/admin/customers/trash", { id });
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
    const result = await confirmDelete("This action cannot be undone. The customer will be lost forever.");

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
          <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-gold" />
            Trash Directory
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
            View soft-deleted customers
          </p>
        </div>
      </div>

      <div className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-foreground/5 pb-6">
          <h3 className="font-serif text-lg font-bold text-foreground w-full sm:w-auto">
            Trashed Customers List
          </h3>
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 border border-foreground/10 px-4 py-2 pl-10 rounded-full text-xs text-foreground outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-gold"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-foreground/10 rounded-xl">
            <User className="w-12 h-12 mb-2 opacity-50" />
            <p>No trashed customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/10 text-muted-foreground text-sm">
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
                    className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-foreground/10 flex items-center justify-center bg-foreground/5 font-bold text-gold text-sm">
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

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center pt-6 pb-6 gap-3">
            <Pagination data={{ currentPage, totalPages }} isAdmin={true} />
            <span className="text-xs text-muted-foreground">
              Showing {customers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} trashed customers
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
