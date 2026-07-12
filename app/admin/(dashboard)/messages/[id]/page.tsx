"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Calendar, Hash, CheckCircle, MailOpen, Trash2 } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { confirmDelete } from "@/utils/swal";

interface MessageDetail {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "Unread" | "Read" | "Replied";
  createdAt: string;
}

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { getMethod, patchMethod, deleteMethod } = BasicProvider();

  const fetchMessage = async () => {
    try {
      const data = await getMethod(`/api/messages/${id}`);
      if (data && data.success) {
        setMessage(data.messageData);
      } else {
        toast.error(data?.message || "Failed to load message.");
        router.push("/admin/messages");
      }
    } catch (err) {
      toast.error("Error connecting to server.");
      router.push("/admin/messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

  const handleUpdateStatus = async (newStatus: MessageDetail["status"]) => {
    try {
      const data = await patchMethod(`/api/messages/${id}`, { status: newStatus });
      if (data && data.success) {
        toast.success(`Message marked as ${newStatus}.`);
        setMessage((prev) => prev ? { ...prev, status: newStatus } : null);
      } else {
        toast.error(data.message || "Failed to update message.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update message.");
    }
  };

  const handleDelete = async () => {
    const result = await confirmDelete("Are you sure you want to delete this message record?");
    if (!result.isConfirmed) return;
    try {
      const data = await deleteMethod(`/api/messages/${id}`);
      if (data && data.success) {
        toast.success("Message deleted successfully.");
        router.push("/admin/messages");
      } else {
        toast.error(data.message || "Failed to delete message.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!message) return null;

  let statusBadge = "";
  switch (message.status) {
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/messages")}
            className="p-2 border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground leading-none flex items-center gap-3">
              Message Details
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge}`}>
                {message.status}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
              Viewing inquiry from {message.name}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {message.status === "Unread" && (
            <button
              onClick={() => handleUpdateStatus("Read")}
              className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-blue-500/10 text-foreground hover:text-blue-400 border border-foreground/10 hover:border-blue-500/20 rounded-xl text-sm font-medium transition-colors"
            >
              <MailOpen className="w-4 h-4" />
              Mark as Read
            </button>
          )}
          {message.status !== "Replied" && (
            <button
              onClick={() => handleUpdateStatus("Replied")}
              className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-emerald-500/10 text-foreground hover:text-emerald-400 border border-foreground/10 hover:border-emerald-500/20 rounded-xl text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Replied
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Metadata */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-foreground/10 space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2">
              Sender Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                  <p className="font-medium text-sm text-foreground">{message.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${message.email}`} className="font-medium text-sm text-gold hover:underline transition-all break-all">
                    {message.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Received On</p>
                  <p className="font-medium text-sm text-foreground">
                    {new Date(message.createdAt).toLocaleDateString("en-US", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(message.createdAt).toLocaleTimeString("en-US", {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Message ID</p>
                  <p className="font-mono text-xs text-muted-foreground break-all">{message._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Message Content */}
        <div className="md:col-span-2">
          <div className="glass p-6 sm:p-8 rounded-2xl border border-foreground/10 h-full flex flex-col">
            <h3 className="font-serif text-xl font-bold text-foreground mb-6 text-gradient-gold">
              {message.subject}
            </h3>
            
            <div className="bg-surface/50 border border-foreground/5 p-6 rounded-xl flex-grow">
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                {message.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
