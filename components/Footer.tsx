"use client";

import { FormEvent } from "react";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#about", label: "About" },
  { href: "#gallery", label: "Gallery" },
  { href: "#reservation", label: "Reservation" },
];

interface FooterProps {
  settings?: {
    openHoursTueFri?: string;
    openHoursSatSun?: string;
    openHoursMon?: string;
  } | null;
}

export default function Footer({ settings }: FooterProps) {
  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Subscribed.");
  };

  const tueFri = settings?.openHoursTueFri || "Tuesday – Friday · 17:00 – 23:00";
  const satSun = settings?.openHoursSatSun || "Saturday – Sunday · 12:00 – 23:30";
  const mon = settings?.openHoursMon || "Monday · Closed";

  return (
    <footer className="border-t border-white/5 bg-surface/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 md:px-8">
        <div>
          <div className="font-serif text-3xl text-gradient-gold">Auréa</div>
          <p className="mt-4 text-sm text-foreground/60">
            A modern sanctuary of fine dining. Since 2012.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-lg text-gold">Quick Links</h4>
          <ul className="mt-4 grid gap-2 text-sm text-foreground/70">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-gold">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg text-gold">Opening Hours</h4>
          <ul className="mt-4 grid gap-2 text-sm text-foreground/70">
            <li>{tueFri}</li>
            <li>{satSun}</li>
            <li>{mon}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg text-gold">Newsletter</h4>
          <p className="mt-4 text-sm text-foreground/60">Seasonal menus & private events.</p>
          <form
            onSubmit={handleSubscribe}
            className="mt-4 flex overflow-hidden rounded-full border border-white/10"
          >
            <input type="email" required placeholder="Your email" className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none" />
            <button className="bg-gold px-4 text-primary-foreground">→</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-foreground/50">
        © {new Date().getFullYear()} Auréa Dining. All rights reserved.
      </div>
    </footer>
  );
}
