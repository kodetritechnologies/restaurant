"use client";

import { useEffect, useState, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Trash2, CheckCircle2, XCircle, Check, ArrowLeft, RefreshCw } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { confirmDelete } from "@/utils/swal";
import Pagination from "@/components/Pagination";

interface Reservation {
  _id: string;
  name: string;
  phone: string;
  email: string;
  guests: number;
  date: string;
  time: string;
  request: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
}

export default function BookingsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status") || "All";

  const itemsPerPage = 10;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { getMethod, patchMethod, deleteMethod } = BasicProvider();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchReservations = async (status = statusFilter, search = debouncedSearch) => {
    setLoading(true);
    try {
      const endpoint = `/api/reservations?status=${status}&search=${search}&page=${currentPage}&limit=${itemsPerPage}`;
      const data = await getMethod(endpoint);
      if (data && data.success) {
        setReservations(data.reservations);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.reservations.length);
      } else {
        toast.error(data?.message || "Failed to load reservations.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(statusFilter, debouncedSearch);
  }, [statusFilter, debouncedSearch, currentPage]);

  const handleUpdateStatus = async (id: string, newStatus: Reservation["status"]) => {
    try {
      const data = await patchMethod(`/api/reservations/${id}`, { status: newStatus });
      if (data && data.success) {
        toast.success(`Reservation marked as ${newStatus}.`);
        fetchReservations();
      } else {
        toast.error(data.message || "Failed to update reservation.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update reservation.");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await confirmDelete("You won't be able to revert this deleted reservation!");

    if (!result.isConfirmed) return;

    try {
      const data = await deleteMethod(`/api/reservations/${id}`);
      if (data && data.success) {
        toast.success("Reservation deleted successfully.");
        fetchReservations();
      } else {
        toast.error(data.message || "Failed to delete reservation.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete reservation.");
    }
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (val === "All") {
        params.delete("status");
      } else {
        params.set("status", val);
      }
      params.set("page", "1");
      router.push(`/admin/bookings?${params.toString()}`);
    });
  };

  const paginationData = {
    currentPage,
    totalPages,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="p-2 border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
            Reservations Log
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
            Manage table bookings and reservations
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:flex md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by client name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-foreground/10 bg-surface/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-gold transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${statusFilter === status
                ? "bg-gold border-gold text-primary-foreground shadow-gold"
                : "bg-surface/50 border-foreground/10 text-muted-foreground hover:text-gold hover:border-gold/40"
                }`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={() => fetchReservations()}
            className="p-2 bg-surface/50 border border-foreground/10 hover:border-gold/45 text-muted-foreground hover:text-gold rounded-full transition-all cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-foreground/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-foreground/5 bg-surface/70 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-3 md:px-4">Client Details</th>
                <th className="py-4 px-3 md:px-4 text-center">Guests</th>
                <th className="py-4 px-3 md:px-4">Reserved Slot</th>
                <th className="py-4 px-3 md:px-4">Special Requests</th>
                <th className="py-4 px-3 md:px-4 text-center">Status</th>
                <th className="py-4 px-3 md:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
                      Retrieving booking data...
                    </p>
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    No reservations found matching the criteria.
                  </td>
                </tr>
              ) : (
                reservations.map((b) => {
                  let badgeClass = "";
                  switch (b.status) {
                    case "Pending":
                      badgeClass = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                      break;
                    case "Confirmed":
                      badgeClass = "bg-gold/15 border-gold/30 text-gold";
                      break;
                    case "Completed":
                      badgeClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                      break;
                    case "Cancelled":
                      badgeClass = "bg-rose-500/10 border-rose-500/20 text-rose-400";
                      break;
                  }

                  return (
                    <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-3 md:px-4">
                        <div className="font-semibold text-foreground">{b.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{b.phone}</div>
                        <div className="text-xs text-muted-foreground">{b.email}</div>
                      </td>
                      <td className="py-4 px-3 md:px-4 text-center font-serif text-lg font-bold text-foreground">
                        {b.guests}
                      </td>
                      <td className="py-4 px-3 md:px-4">
                        <div className="font-semibold text-foreground">{b.date}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{b.time}</div>
                      </td>
                      <td className="py-4 px-3 md:px-4 max-w-[150px] md:max-w-xs truncate" title={b.request}>
                        <span className="text-xs text-foreground/80 italic">
                          {b.request || "None"}
                        </span>
                      </td>
                      <td className="py-4 px-3 md:px-4 text-center">
                        <span className={`inline-flex px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border ${badgeClass}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 md:px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {b.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b._id, "Confirmed")}
                                className="p-1.5 bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-primary-foreground rounded-lg transition-colors cursor-pointer"
                                title="Approve Reservation"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b._id, "Cancelled")}
                                className="p-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Reject Reservation"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {b.status === "Confirmed" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b._id, "Completed")}
                                className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Mark Completed"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b._id, "Cancelled")}
                                className="p-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Cancel Reservation"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="p-1.5 bg-foreground/5 border border-foreground/10 text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center pt-6 pb-6 gap-3">
            <Pagination data={paginationData} isAdmin={true} />
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
