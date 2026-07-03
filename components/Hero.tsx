"use client";

const hero = "/assets/hero.jpg";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden">
      <img src={hero} alt="Luxury restaurant interior" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow reveal">Est. 2012 · Fine Dining</p>
        <h1 className="reveal mt-6 font-serif text-5xl leading-[1.05] md:text-7xl lg:text-8xl">
          Experience <em className="text-gradient-gold not-italic">Fine Dining</em>
          <br />Like Never Before
        </h1>
        <p className="reveal mx-auto mt-6 max-w-xl text-base text-foreground/75 md:text-lg">
          Fresh Ingredients. World-Class Chefs. Memorable Moments.
        </p>
        <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#reservation"
            className="rounded-full bg-gradient-gold px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
          >
            Reserve a Table
          </a>
          <a
            href="#menu"
            className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-medium text-foreground/90 backdrop-blur transition-colors hover:border-gold hover:text-gold"
          >
            Explore Menu
          </a>
        </div>
      </div>
      <a
        href="#categories"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="grid h-10 w-6 place-items-start rounded-full border border-white/40 pt-2">
          <span className="block h-2 w-1 animate-[scroll-bounce_1.6s_ease-in-out_infinite] rounded-full bg-gold" />
        </div>
      </a>
    </section>
  );
}
