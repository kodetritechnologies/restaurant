"use client";

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
    shopDescription?: string;
  } | null;
}

export default function Footer({ settings }: FooterProps) {
  const tueFri = settings?.openHoursTueFri || "";
  const satSun = settings?.openHoursSatSun || "";
  const mon = settings?.openHoursMon || "";
  const shopDescription = settings?.shopDescription;

  return (
    <footer className="border-t border-white/5 bg-surface/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:px-8">
        <div>
          <img src="/assets/logo.svg" alt="UDIPI Restaurant" className="h-16 w-auto object-contain" />
          <p className="mt-4 text-sm text-foreground/60">
            {shopDescription}
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
      </div>
      <div className="border-t border-white/5 py-6 flex flex-col items-center gap-2 text-center text-xs text-foreground/50">
        <p>© {new Date().getFullYear()} UDIPI Restaurant. All rights reserved.</p>
        <p>
          Website designed by{" "}
          <a
            href="https://kodetri.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline transition-all"
          >
            Kodetri Technologies
          </a>
        </p>
      </div>
    </footer>
  );
}
