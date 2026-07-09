"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

interface ContactProps {
  settings?: {
    shopPhone?: string;
    whatsappNumber?: string;
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setErrors({});

    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const newErrors: Record<string, string> = {};

    if (!name || name.trim() === "") {
      newErrors.name = "Please enter your name.";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
    }
    
    if (!email || email.trim() === "") {
      newErrors.email = "Please enter your email.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!subject || subject.trim() === "") {
      newErrors.subject = "Please enter a subject.";
    }

    if (!message || message.trim() === "") {
      newErrors.message = "Please enter a message.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
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
        form.reset();
        setErrors({});
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
  const whatsapp = settings?.whatsappNumber || "+33145678900";
  const emailProp = settings?.shopEmail || "reserve@aurea.dining";
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
    { label: "Instagram", href: instagram, icon: <InstagramIcon className="w-5 h-5" /> },
    { label: "Facebook", href: facebook, icon: <FacebookIcon className="w-5 h-5" /> },
    { label: "X", href: twitter, icon: <XIcon className="w-5 h-5" /> },
  ];

  return (
    <section id="contact" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-32">
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
          <div className="grid gap-4 p-5 sm:p-8">
            {[
              ["Address", address],
              ["Phone", phone],
              ["WhatsApp", whatsapp],
              ["Email", emailProp],
              ["Hours", hours],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 border-b border-foreground/5 pb-3 last:border-0">
                <span className="text-xs uppercase tracking-widest text-foreground/60 shrink-0">{k}</span>
                <span className="text-left sm:text-right text-foreground/90 break-words">{v}</span>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="rounded-full border border-foreground/10 p-3 text-foreground/70 hover:border-gold hover:text-gold hover:bg-gold/10 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="reveal glass grid gap-4 rounded-3xl p-5 sm:p-8"
          noValidate
        >
          {(
            [
              { l: "Name", t: "text", n: "name" },
              { l: "Email", t: "email", n: "email" },
              { l: "Subject", t: "text", n: "subject" },
            ] as const
          ).map((f) => (
            <label key={f.l} className="grid gap-2">
              <span className="text-xs uppercase tracking-widest text-foreground/60">{f.l}</span>
              <input type={f.t} name={f.n} className={`rounded-xl border ${errors[f.n] ? 'border-red-500/70' : 'border-foreground/10'} bg-background/60 px-4 py-3 outline-none focus:border-gold transition-colors`} />
              {errors[f.n] && <span className="text-xs text-red-400">{errors[f.n]}</span>}
            </label>
          ))}
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-widest text-foreground/60">Message</span>
            <textarea name="message" rows={5} className={`rounded-xl border ${errors.message ? 'border-red-500/70' : 'border-foreground/10'} bg-background/60 px-4 py-3 outline-none focus:border-gold transition-colors`} />
            {errors.message && <span className="text-xs text-red-400">{errors.message}</span>}
          </label>
          <button type="submit" disabled={loading} className="mt-2 rounded-full bg-gradient-gold px-6 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-75">
            {loading ? "Sending message..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
