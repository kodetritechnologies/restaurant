"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const hero = "/assets/hero.jpg";

export default function Reservation() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      guests: formData.get("guests"),
      date: formData.get("date"),
      time: formData.get("time"),
      request: formData.get("request"),
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success("Reservation request sent! We will confirm shortly.");
        e.currentTarget.reset();
      } else {
        toast.error(data.message || "Failed to create reservation.");
      }
    } catch (err) {
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

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
          onSubmit={handleSubmit}
          className="reveal glass grid gap-4 rounded-3xl p-6 md:grid-cols-2 md:p-10"
        >
          {[
            { label: "Full Name", type: "text", name: "name" },
            { label: "Phone", type: "tel", name: "phone" },
            { label: "Email", type: "email", name: "email" },
            { label: "Guests", type: "number", name: "guests" },
            { label: "Date", type: "date", name: "date" },
            { label: "Time", type: "time", name: "time" },
          ].map((f) => (
            <label key={f.name} className="grid gap-2">
              <span className="text-xs uppercase tracking-widest text-foreground/60">{f.label}</span>
              <input
                type={f.type}
                name={f.name}
                required
                className="rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-foreground outline-none transition-colors focus:border-gold"
              />
            </label>
          ))}
          <label className="grid gap-2 md:col-span-2">
            <span className="text-xs uppercase tracking-widest text-foreground/60">Special Request</span>
            <textarea
              name="request"
              rows={4}
              className="rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-foreground outline-none transition-colors focus:border-gold"
            />
          </label>
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
