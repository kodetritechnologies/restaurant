"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import socket from "@/utils/socket";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

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
  const { postMethod } = BasicProvider();
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
      const data = await postMethod("/api/messages", payload);

      if (data && data.success) {
        toast.success("Message sent! We will read it shortly.");
        form.reset();
        setErrors({});
        try {
          const finalMessage = `New Contact Message from ${payload.name}`;
          const resNotif = await postMethod("/api/notifications", { message: finalMessage });
          const notif = resNotif?.notification;
          socket.emit("call_waiter", { 
            _id: notif?._id,
            message: finalMessage, 
            timestamp: notif?.createdAt || new Date().toISOString() 
          });
        } catch (e) {
          console.error("Failed to emit notification:", e);
        }
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Message error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const address = settings?.shopAddress || "12 Rue de l'Élégance, 75008 Paris";
  const phone = settings?.shopPhone || "+33 1 45 67 89 00";
  const whatsapp = settings?.whatsappNumber || "+33145678900";
  const emailProp = settings?.shopEmail || "reserve@aurea.dining";
  const hours = settings?.shortHours || "";

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
    { label: "Instagram", href: instagram, icon: <FaInstagram className="w-5 h-5" /> },
    { label: "Facebook", href: facebook, icon: <FaFacebook className="w-5 h-5" /> },
    { label: "X", href: twitter, icon: <FaXTwitter className="w-5 h-5" /> },
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.2533077944454!2d75.89635657435785!3d22.718824427597035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd9ddd344e01%3A0xa7f912271ea81f68!2sNew%20udipi%20restaurant!5e0!3m2!1sen!2sin!4v1784314321484!5m2!1sen!2sin"
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <div className="grid gap-4 p-5 sm:p-8">
            {[
              ["Address", address],
              ["Phone", phone],
              ["WhatsApp", whatsapp],
              ["Email", emailProp],
              ["Hours", hours],
            ].filter(([, v]) => v).map(([k, v]) => (
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
