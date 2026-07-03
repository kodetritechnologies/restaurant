"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  DollarSign,
  Clock,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Check,
  X
} from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";

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
}

interface DashboardStats {
  totalBookingsCount: number;
  totalRevenue: number;
  pendingBookingsCount: number;
  totalMessagesCount: number;
  chartItems: { day: string; count: number; height: string }[];
  popularHours: { name: string; count: number; percentage: number }[];
  pendingBookings: Reservation[];
}

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { getMethod, patchMethod } = BasicProvider();

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const data = await getMethod("/api/dashboard/stats");
      if (data && data.success) {
        setStats(data.stats);
      } else {
        toast.error(data?.message || "Failed to load dashboard metrics.");
      }
    } catch (error) {
      console.error("Failed to load overview data:", error);
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Reservation["status"]) => {
    try {
      const data = await patchMethod(`/api/reservations/${id}`, { status: newStatus });
      if (data && data.success) {
        toast.success(`Reservation marked as ${newStatus}.`);
        fetchOverviewData();
      } else {
        toast.error(data.message || "Failed to update status.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status.");
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-foreground">
        <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
          Loading dashboard overview...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
          Restaurant Overview
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
          Key performance metrics and live updates
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Bookings", value: stats.totalBookingsCount, icon: CalendarDays, change: "All table reservations", path: "/admin/bookings" },
          { label: "Estimated Revenue", value: `$${stats.totalRevenue}`, icon: DollarSign, change: "Based on confirmed covers", path: "/admin/bookings" },
          { label: "Pending Approvals", value: stats.pendingBookingsCount, icon: Clock, change: "Awaiting confirmation", path: "/admin/bookings?status=Pending" },
          { label: "Unread Messages", value: stats.totalMessagesCount, icon: MessageSquare, change: "Customer contact inbox", path: "/admin/messages?status=Unread" }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => router.push(stat.path)}
              className="glass p-5 rounded-2xl shadow-soft hover:border-gold/45 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className="p-2 bg-gold/10 border border-gold/20 text-gold rounded-xl">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-3 font-serif text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] font-medium text-gold/80 tracking-wide uppercase">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytical Charts & Service Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analytic Graph */}
        <div className="glass p-6 rounded-3xl shadow-elegant lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">Reservations Frequency</h3>
              <p className="text-xs text-muted-foreground">Showing reservation daily distributions</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-gold bg-gold/10 px-3 py-1.5 rounded-full font-semibold border border-gold/25">
              <TrendingUp className="h-3.5 w-3.5" />
              Real-time
            </span>
          </div>

          {/* SVG Chart */}
          <div className="h-56 w-full flex items-end justify-between pt-6 border-b border-white/5 px-2">
            {stats.chartItems.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group w-10 relative">
                {/* Tooltip */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-[-30px] bg-gold text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-elegant whitespace-nowrap z-10">
                  {item.count} bks
                </span>
                {/* Bar */}
                <div
                  style={{ height: item.height }}
                  className="w-4 sm:w-6 bg-gradient-gold rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-gold group-hover:scale-y-[1.03] origin-bottom"
                />
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-1">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Service Progress list */}
        <div className="glass p-6 rounded-3xl shadow-elegant space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Popular Hours</h3>
            <p className="text-xs text-muted-foreground">Reservation hours breakdown</p>
          </div>

          <div className="space-y-4.5 pt-2">
            {stats.popularHours.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-foreground">{item.name}</span>
                  <span className="text-gold">{item.count} tables</span>
                </div>
                <div className="h-2 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.15 }}
                    className="h-full bg-gradient-gold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions & Recent bookings summary */}
      <div className="glass p-6 rounded-3xl shadow-elegant space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Pending Approvals</h3>
            <p className="text-xs text-muted-foreground">Reservations currently awaiting confirmations</p>
          </div>
          <button
            onClick={() => router.push("/admin/bookings?status=Pending")}
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-gold border border-gold/25 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors"
          >
            <span>Process Reservations</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* List of pending bookings */}
        <div className="divide-y divide-white/5">
          {stats.pendingBookings.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">No pending confirmations!</p>
          ) : (
            stats.pendingBookings.map((b) => {
              return (
                <div key={b._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4.5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-bold text-gold shrink-0">
                      {b.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Party of {b.guests} guests · {b.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-foreground">
                        {b.date} @ {b.time}
                      </p>
                      <p className="text-[10px] text-gold font-bold">Est. ${b.guests * 50} cover</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(b._id, "Confirmed")}
                        className="p-1.5 bg-gold/10 border border-gold/30 rounded-lg text-gold hover:bg-gold hover:text-primary-foreground transition-colors cursor-pointer"
                        title="Approve Booking"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b._id, "Cancelled")}
                        className="p-1.5 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive-foreground hover:bg-destructive hover:text-white transition-colors cursor-pointer"
                        title="Reject Booking"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
