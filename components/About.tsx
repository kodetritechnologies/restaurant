"use client";

const about = "/assets/about.jpg";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="reveal relative">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img src={about} alt="Restaurant interior" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-gold/40 bg-background/90 px-8 py-6 shadow-[var(--shadow-gold)] backdrop-blur md:block">
            <div className="font-serif text-4xl text-gradient-gold">12+</div>
            <div className="text-xs uppercase tracking-widest text-foreground/70">Years of craft</div>
          </div>
        </div>
        <div className="reveal">
          <p className="eyebrow">Our Story</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">A Legacy of Refined Taste</h2>
          <p className="mt-6 text-foreground/70">
            Since 2012, Auréa has been a sanctuary for those who believe that a meal is more than nourishment —
            it's a ritual. From the marble bar to the candlelit tables, every detail has been considered.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {["Fresh Ingredients", "Award-winning Chefs", "Since 2012", "Seasonal Menus"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 text-gold">✓</span>
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
          <a
            href="#chefs"
            className="mt-10 inline-flex rounded-full border border-gold/60 px-7 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
