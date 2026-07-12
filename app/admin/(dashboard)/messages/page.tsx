"use client";

import { useEffect, useState, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Trash2, Mail, MailOpen, Check, ArrowLeft, RefreshCw, Eye } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import { confirmDelete } from "@/utils/swal";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "Unread" | "Read" | "Replied";
  createdAt: string;
}

export default function MessagesManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialStatus = searchParams.get("status") || "All";

  const itemsPerPage = 10;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { getMethod, patchMethod, deleteMethod } = BasicProvider();

  // Simple search debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMessages = async (status = statusFilter, search = debouncedSearch) => {
    setLoading(true);
    try {
      const endpoint = `/api/messages?status=${status}&search=${search}&page=${currentPage}&limit=${itemsPerPage}`;
      const data = await getMethod(endpoint);
      if (data && data.success) {
        setMessages(data.messages);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.messages.length);
      } else {
        toast.error(data?.message || "Failed to load messages.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(statusFilter, debouncedSearch);
  }, [statusFilter, debouncedSearch, currentPage]);

  const handleUpdateStatus = async (id: string, newStatus: Message["status"]) => {
    try {
      const data = await patchMethod(`/api/messages/${id}`, { status: newStatus });
      if (data && data.success) {
        toast.success(`Message marked as ${newStatus}.`);
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to update message.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update message.");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await confirmDelete("Are you sure you want to delete this message record?");
    if (!result.isConfirmed) return;
    try {
      const data = await deleteMethod(`/api/messages/${id}`);
      if (data && data.success) {
        toast.success("Message deleted successfully.");
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to delete message.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message.");
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
      router.push(`/admin/messages?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="p-2 border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
            Messages Inbox
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
            Read and reply to customer inquiries
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid gap-4 md:flex md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, subject, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-foreground/10 bg-surface/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-gold transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {["All", "Unread", "Read", "Replied"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-gold border-gold text-primary-foreground shadow-gold"
                  : "bg-surface/50 border-foreground/10 text-muted-foreground hover:text-gold hover:border-gold/40"
              }`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={() => fetchMessages()}
            className="p-2 bg-surface/50 border border-foreground/10 hover:border-gold/45 text-muted-foreground hover:text-gold rounded-full transition-all cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Message Table */}
      <div className="glass overflow-hidden rounded-2xl border border-foreground/5 shadow-elegant">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
              Retrieving inbox messages...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No inquiries in inbox matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => {
                  let statusBadge = "";
                  switch (m.status) {
                    case "Unread":
                      statusBadge = "bg-blue-500/10 border-blue-500/20 text-blue-400";
                      break;
                    case "Read":
                      statusBadge = "bg-foreground/5 border-foreground/10 text-foreground/80";
                      break;
                    case "Replied":
                      statusBadge = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                      break;
                  }

                  return (
                    <tr
                      key={m._id}
                      className={`border-b border-foreground/5 hover:bg-foreground/5 transition-colors group ${
                        m.status === "Unread" ? "bg-foreground/[0.02]" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{m.name}</span>
                          <span className="text-xs text-muted-foreground">{m.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground/90 max-w-[200px] truncate">
                        {m.subject}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 transition-opacity">
                          <button
                            onClick={() => router.push(`/admin/messages/${m._id}`)}
                            className="p-1.5 bg-foreground/5 hover:bg-gold/15 border border-foreground/10 hover:border-gold/30 text-muted-foreground hover:text-gold rounded-lg transition-colors cursor-pointer"
                            title="View Message Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {m.status === "Unread" && (
                            <button
                              onClick={() => handleUpdateStatus(m._id, "Read")}
                              className="p-1.5 bg-foreground/5 hover:bg-blue-500/15 border border-foreground/10 hover:border-blue-500/30 text-muted-foreground hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                              title="Mark as Read"
                            >
                              <MailOpen className="h-4 w-4" />
                            </button>
                          )}
                          {m.status !== "Replied" && (
                            <button
                              onClick={() => handleUpdateStatus(m._id, "Replied")}
                              className="p-1.5 bg-foreground/5 hover:bg-emerald-500/15 border border-foreground/10 hover:border-emerald-500/30 text-muted-foreground hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Mark as Replied"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="p-1.5 bg-foreground/5 hover:bg-destructive/15 border border-foreground/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive-foreground rounded-lg transition-colors cursor-pointer"
                            title="Delete Message"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center pt-6 pb-6 gap-3 border-t border-foreground/5">
            <Pagination data={{ currentPage, totalPages }} isAdmin={true} />
            <span className="text-xs text-muted-foreground">
              Showing {messages.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} messages
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
