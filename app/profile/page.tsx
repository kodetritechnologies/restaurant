"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Loader2, Save, Mail } from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import toast from "react-hot-toast";

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-background/60 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30";

const LABEL_CLASS =
  "block text-[10px] font-semibold uppercase tracking-widest text-gold mb-1.5";

export default function ProfilePage() {
  const { customer, refreshCustomer } = useCustomer();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  // Pre-fill form from context
  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/customer/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Profile updated successfully");
        await refreshCustomer();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Personal Details</h2>
          <p className="text-sm text-muted-foreground mt-1">Update your personal information and address.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Readonly Email */}
        <div>
          <label className={LABEL_CLASS}>Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={customer.email}
              readOnly
              disabled
              className={INPUT_CLASS + " pl-11 opacity-60 cursor-not-allowed"}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Your email address cannot be changed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={LABEL_CLASS}>Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className={INPUT_CLASS + " pl-11"}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className={INPUT_CLASS + " pl-11"}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS}>Delivery Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
              <textarea
                rows={2}
                placeholder="123 Main Street, Apartment 4B"
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                className={INPUT_CLASS + " pl-11 resize-none"}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="New York"
                value={form.city}
                onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                className={INPUT_CLASS + " pl-11"}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.02] disabled:opacity-75 disabled:pointer-events-none"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
