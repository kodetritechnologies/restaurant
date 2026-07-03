"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

interface ContactProps {
  settings?: {
    shopPhone?: string;
    shopEmail?: string;
    shopAddress?: string;
    shortHours?: string;
    instagramUsername?: string;
    facebookUsername?: string;
    twitterUsername?: string;
  } | null;
}

export default function Contact({ settings }: ContactProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success("Message sent! We will read it shortly.");
        e.currentTarget.reset();
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (err) {
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const address = settings?.shopAddress || "12 Rue de l'Élégance, 75008 Paris";
  const phone = settings?.shopPhone || "+33 1 45 67 89 00";
  const email = settings?.shopEmail || "reserve@aurea.dining";
  const hours = settings?.shortHours || "Tue–Sun · 17:00 – 23:30";

  const instagram = settings?.instagramUsername 
    ? (settings.instagramUsername.startsWith("http") ? settings.instagramUsername : `https://instagram.com/${settings.instagramUsername}`)
    : "https://instagram.com";
  const facebook = settings?.facebookUsername 
    ? (settings.facebookUsername.startsWith("http") ? settings.facebookUsername : `https://facebook.com/${settings.facebookUsername}`)
    : "https://facebook.com";
  const twitter = settings?.twitterUsername 
    ? (settings.twitterUsername.startsWith("http") ? settings.twitterUsername : `https://twitter.com/${settings.twitterUsername}`)
    : "https://twitter.com";

  const socialLinks = [
    { label: "Instagram", href: instagram },
    { label: "Facebook", href: facebook },
    { label: "Twitter", href: twitter },
  ];

  return (
    <section id="contact" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="reveal mb-14 text-center">
        <p className="eyebrow">Visit Us</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">Get in Touch</h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="reveal glass overflow-hidden rounded-3xl">
          <iframe
            title="Map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=2.32%2C48.85%2C2.36%2C48.87&layer=mapnik"
            className="h-72 w-full border-0 grayscale"
            loading="lazy"
          />
          <div className="grid gap-4 p-8">
            {[
              ["Address", address],
              ["Phone", phone],
              ["Email", email],
              ["Hours", hours],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0">
                <span className="text-xs uppercase tracking-widest text-foreground/60">{k}</span>
                <span className="text-right text-foreground/90">{v}</span>
              </div>
            ))}
            <div className="mt-2 flex gap-3">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-foreground/70 hover:border-gold hover:text-gold transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="reveal glass grid gap-4 rounded-3xl p-8"
        >
          {[
            { l: "Name", t: "text", n: "name" },
            { l: "Email", t: "email", n: "email" },
            { l: "Subject", t: "text", n: "subject" },
          ].map((f) => (
            <label key={f.l} className="grid gap-2">
              <span className="text-xs uppercase tracking-widest text-foreground/60">{f.l}</span>
              <input type={f.t} name={f.n} required className="rounded-xl border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-gold" />
            </label>
          ))}
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-widest text-foreground/60">Message</span>
            <textarea name="message" rows={5} required className="rounded-xl border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-gold" />
          </label>
          <button type="submit" disabled={loading} className="mt-2 rounded-full bg-gradient-gold px-6 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-75">
            {loading ? "Sending message..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
