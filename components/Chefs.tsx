"use client";

interface ChefsProps {
  chefs?: {
    _id: string;
    name: string;
    role: string;
    image: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  }[] | null;
}

export default function Chefs({ chefs: dbChefs }: ChefsProps) {
  const finalChefs = dbChefs && dbChefs.length > 0
    ? dbChefs.map((c) => ({
        name: c.name,
        role: c.role,
        img: c.image,
        exp: "", // Custom dynamic entries skip raw exp
        instagram: c.instagram,
        facebook: c.facebook,
        twitter: c.twitter,
      }))
    : [];

  if (finalChefs.length === 0) return null;

  return (
    <section id="chefs" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="reveal mb-14 text-center">
        <p className="eyebrow">The Kitchen</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">Meet Our Chefs</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {finalChefs.map((c) => (
          <article key={c.name} className="reveal group overflow-hidden rounded-3xl border border-white/5 bg-card hover-lift">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
            <div className="p-6 text-center">
              <h3 className="font-serif text-2xl">{c.name}</h3>
              <p className="mt-1 text-sm text-gold">{c.role}</p>
              {c.exp && (
                <p className="mt-1 text-xs uppercase tracking-widest text-foreground/60">{c.exp} experience</p>
              )}
              <div className="mt-4 flex justify-center gap-3 text-foreground/70">
                {c.instagram && (
                  <a href={c.instagram.startsWith("http") ? c.instagram : `https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-xs transition-colors hover:border-gold hover:text-gold">
                    IG
                  </a>
                )}
                {c.facebook && (
                  <a href={c.facebook.startsWith("http") ? c.facebook : `https://facebook.com/${c.facebook}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-xs transition-colors hover:border-gold hover:text-gold">
                    FB
                  </a>
                )}
                {c.twitter && (
                  <a href={c.twitter.startsWith("http") ? c.twitter : `https://twitter.com/${c.twitter}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-xs transition-colors hover:border-gold hover:text-gold">
                    TW
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
