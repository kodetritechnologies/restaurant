"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const hero = "/assets/hero.jpg";

export default function Reservation() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    guests: "",
    date: "",
    time: "",
    request: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Remove all non-numeric characters
      const numericValue = value.replace(/\D/g, "");
      // Restrict to max 10 digits
      if (numericValue.length > 10) return;
      
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // JS Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.guests || Number(formData.guests) < 1) {
      newErrors.guests = "At least 1 guest required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success("Reservation request sent! We will confirm shortly.");
        setFormData({ name: "", phone: "", email: "", guests: "", date: "", time: "", request: "" });
      } else {
        toast.error(data.message || "Failed to create reservation.");
      }
    } catch (err) {
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name", type: "text", name: "name" },
    { label: "Phone", type: "tel", name: "phone" },
    { label: "Email", type: "email", name: "email" },
    { label: "Guests", type: "number", name: "guests" },
    { label: "Date", type: "date", name: "date" },
    { label: "Time", type: "time", name: "time" },
  ];

  return (
    <section id="reservation" className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 opacity-20">
        <img src={hero} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-background/85" />
      <div className="relative mx-auto max-w-4xl px-5 md:px-8">
        <div className="reveal mb-10 text-center">
          <p className="eyebrow">Book Your Table</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Reserve Your Evening</h2>
          <p className="mx-auto mt-4 max-w-lg text-foreground/65">
            A table is waiting. Share a few details and we'll confirm within the hour.
          </p>
        </div>
        <form
          noValidate
          onSubmit={handleSubmit}
          className="reveal glass grid gap-4 rounded-3xl p-6 md:grid-cols-2 md:p-10"
        >
          {fields.map((f) => (
            <div key={f.name} className="grid gap-2">
              <label className="text-xs uppercase tracking-widest text-foreground/60">{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                value={(formData as any)[f.name]}
                onChange={handleChange}
                className={`rounded-xl border bg-background/60 px-4 py-3 text-foreground outline-none transition-colors ${
                  f.type === 'date' || f.type === 'time' ? '[color-scheme:dark]' : ''
                } ${
                  errors[f.name] ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-gold"
                }`}
              />
              {errors[f.name] && (
                <span className="text-[10px] text-red-400">{errors[f.name]}</span>
              )}
            </div>
          ))}
          <div className="grid gap-2 md:col-span-2">
            <label className="text-xs uppercase tracking-widest text-foreground/60">Special Request</label>
            <textarea
              name="request"
              value={formData.request}
              onChange={handleChange}
              rows={4}
              className="rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-foreground outline-none transition-colors focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-gradient-gold px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 md:col-span-2 disabled:opacity-75 disabled:pointer-events-none"
          >
            {loading ? "Sending reservation..." : "Reserve Table"}
          </button>
        </form>
      </div>
    </section>
  );
}
