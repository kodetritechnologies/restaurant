"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Search, User, Trash2 } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import { confirmDelete } from "@/utils/swal";

interface CustomerItem {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: string;
}

export default function CustomersManager() {
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

  const { getMethod, deleteMethod } = BasicProvider();

  const fetchCustomers = async (search = "") => {
    setLoading(true);
    try {
      const url = search 
        ? `/api/admin/customers?search=${search}&page=${currentPage}&limit=${itemsPerPage}` 
        : `/api/admin/customers?page=${currentPage}&limit=${itemsPerPage}`;
      const data = await getMethod(url);
      if (data && data.success) {
        setCustomers(data.customers);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.customers.length);
      } else {
        toast.error("Failed to load customers.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading customers data.");
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

  const handleSoftDelete = async (id: string, email: string) => {
    const result = await confirmDelete(`Customer "${email}" will be moved to trash and can be restored later.`);

    if (!result.isConfirmed) return;

    try {
      const data = await deleteMethod(`/api/admin/customers/${id}`);
      if (data && data.success) {
        toast.success("Customer moved to trash.");
        fetchCustomers(searchTerm);
      } else {
        toast.error(data?.message || "Failed to move customer to trash.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
              Customer Directory
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
              View registered customers
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/admin/customers/trash")}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-full text-xs font-semibold transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Trash
        </button>
      </div>

      <div className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-foreground/5 pb-6">
          <h3 className="font-serif text-lg font-bold text-foreground w-full sm:w-auto">
            Customers List
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

        {/* Customers Table/Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
              Retrieving Customers...
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No customers found for your search." : "No customers registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Joined On</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="/assets/no-image-customer.png"
                          alt={customer.email}
                          className="h-8 w-8 rounded-full border border-gold/20 shrink-0 object-cover group-hover:border-gold/40 transition-colors"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {customer.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {customer.name || <span className="italic opacity-50">Not Provided</span>}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {customer.phone || <span className="italic opacity-50">Not Provided</span>}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleSoftDelete(customer._id, customer.email)}
                        title="Move to Trash"
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} customers
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
