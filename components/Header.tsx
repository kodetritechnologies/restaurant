"use client";

import { useEffect, useState } from "react";
import { User, Search } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import AuthModal from "./AuthModal";
import GlobalSearch from "./GlobalSearch";
import { useCustomer } from "@/context/CustomerContext";

const navLinks = [
  { href: "/#home", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/#about", label: "About" },
  { href: "/#reservation", label: "Reservation" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const { getMethod } = BasicProvider();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
  const { isLoggedIn, logout } = useCustomer();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (y / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    getMethod("/api/settings")
      .then((data) => {
        if (data && data.success && data.settings?.restaurantLogo) {
          setRestaurantLogo(data.settings.restaurantLogo);
        }
      })
      .catch((err) => console.error("Error fetching settings for header:", err));

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed left-0 top-0 z-[90] h-[2px] w-full bg-transparent">
        <div className="h-full bg-gradient-gold transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "glass border-b border-foreground/5 py-3" : "bg-transparent py-5"
          }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
          <a href="/" className="flex items-center gap-2">
            {restaurantLogo ? (
              <img src={restaurantLogo} alt="Restaurant Logo" className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto object-contain" />
            ) : (
              <img src="/assets/logo.svg" alt="UDIPI Restaurant" className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto object-contain" />
            )}
          </a>
          <ul className="hidden items-center gap-6 lg:flex">
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
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-full border border-gold/30 bg-background/50 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-primary-foreground cursor-pointer"
              title="Search menu and categories"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:block">Search</span>
            </button>
            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-background/50 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-primary-foreground cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-foreground/10 bg-background/90 p-2 backdrop-blur-md shadow-elegant">
                    <a
                      href="/profile"
                      className="block rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-foreground/5 hover:text-gold transition-colors"
                    >
                      Profile
                    </a>
                    <button
                      onClick={() => logout()}
                      className="block w-full text-left rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-foreground/5 hover:text-gold transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden md:flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-background/50 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-primary-foreground cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
            <a
              href="/#reservation"
              className="hidden rounded-full border border-gold/60 bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-primary-foreground md:inline-flex"
            >
              Reserve a Table
            </a>
            <button
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-md border border-foreground/10 lg:hidden"
            >
              <span className="text-gold text-xl">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="mx-4 sm:mx-6 mt-3 rounded-2xl bg-background/95 p-5 shadow-2xl backdrop-blur-2xl border border-foreground/10 lg:hidden max-h-[75vh] overflow-y-auto">
            <ul className="grid gap-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-foreground/85 hover:bg-foreground/5 hover:text-gold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              {isLoggedIn ? (
                <>
                  <li>
                    <a
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-foreground/85 hover:bg-foreground/5 hover:text-gold"
                    >
                      Profile
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => logout()}
                      className="block w-full text-left rounded-lg px-3 py-2 text-foreground/85 hover:bg-foreground/5 hover:text-gold"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="block w-full text-left rounded-lg px-3 py-2 text-foreground/85 hover:bg-foreground/5 hover:text-gold"
                  >
                    Customer Login
                  </button>
                </li>
              )}
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
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
