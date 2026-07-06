"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import AuthModal from "./AuthModal";

const navLinks = [
  { href: "/#home", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/#about", label: "About" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#reservation", label: "Reservation" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (y / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed left-0 top-0 z-[90] h-[2px] w-full bg-transparent">
        <div className="h-full bg-gradient-gold transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Nav */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "glass border-b border-white/5 py-3" : "bg-transparent py-5"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl md:text-3xl text-gradient-gold">Auréa</span>
          </a>
          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-gold">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              title="Customer Login"
              className="hidden md:flex items-center justify-center h-10 w-10 rounded-full border border-gold/30 bg-background/50 text-gold transition-all hover:bg-gold hover:text-primary-foreground cursor-pointer"
            >
              <User className="h-4.5 w-4.5" />
            </button>
            <a
              href="/#reservation"
              className="hidden rounded-full border border-gold/60 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-primary-foreground md:inline-flex"
            >
              Reserve a Table
            </a>
            <button
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-md border border-white/10 lg:hidden"
            >
              <span className="text-gold text-xl">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="glass mx-5 mt-3 rounded-2xl p-5 lg:hidden">
            <ul className="grid gap-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-foreground/85 hover:bg-white/5 hover:text-gold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="block w-full text-left rounded-lg px-3 py-2 text-foreground/85 hover:bg-white/5 hover:text-gold"
                >
                  Customer Login
                </button>
              </li>
              <li>
                <a
                  href="/#reservation"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 block rounded-full bg-gold px-4 py-2.5 text-center text-primary-foreground"
                >
                  Reserve a Table
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
