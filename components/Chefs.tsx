"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChefsProps {
  chefs?: {
    _id: string;
    name: string;
    role: string;
    experience?: string;
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
        exp: c.experience,
        instagram: c.instagram,
        facebook: c.facebook,
        twitter: c.twitter,
      }))
    : [];

  if (finalChefs.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);



  const scrollPrev = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth >= 768 ? scrollRef.current.clientWidth / 3 : scrollRef.current.clientWidth * 0.85;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth >= 768 ? scrollRef.current.clientWidth / 3 : scrollRef.current.clientWidth * 0.85;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="chefs" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-32">
      <div className="reveal mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="eyebrow">The Kitchen</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Meet Our Chefs</h2>
        </div>
        <div className="flex gap-3 justify-center md:pb-2">
          <button 
            onClick={scrollPrev}
            className="grid h-12 w-12 place-items-center rounded-full border border-foreground/10 bg-surface/50 text-foreground transition-all hover:bg-gold hover:text-background hover:border-gold"
            aria-label="Previous chef"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={scrollNext}
            className="grid h-12 w-12 place-items-center rounded-full border border-foreground/10 bg-surface/50 text-foreground transition-all hover:bg-gold hover:text-background hover:border-gold"
            aria-label="Next chef"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      {/* Slider Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 -mx-5 px-5 md:-mx-8 md:px-8 items-stretch"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for Firefox/IE
      >
        {/* We can duplicate the chefs list once to create a pseudo-infinite feel if there are few chefs, but native scrolling back to start is cleaner */}
        {finalChefs.map((c, idx) => (
          <div key={idx} className="flex-none w-[85%] md:w-[calc(33.333%-16px)] snap-center">
            <article className="h-full reveal group overflow-hidden rounded-3xl border border-foreground/5 bg-card hover-lift flex flex-col">
              <div className="relative aspect-[4/5] overflow-hidden flex-shrink-0">
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <div className="p-6 text-center flex-grow flex flex-col justify-end">
                <h3 className="font-serif text-2xl">{c.name}</h3>
                <p className="mt-1 text-sm text-gold">{c.role}</p>
                {c.exp && (
                  <p className="mt-1 text-xs uppercase tracking-widest text-foreground/60">{c.exp} experience</p>
                )}
                <div className="mt-4 flex justify-center gap-3 text-foreground/70">
                  {c.instagram && (
                    <a href={c.instagram.startsWith("http") ? c.instagram : `https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-foreground/10 text-xs transition-colors hover:border-gold hover:text-gold">
                      IG
                    </a>
                  )}
                  {c.facebook && (
                    <a href={c.facebook.startsWith("http") ? c.facebook : `https://facebook.com/${c.facebook}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-foreground/10 text-xs transition-colors hover:border-gold hover:text-gold">
                      FB
                    </a>
                  )}
                  {c.twitter && (
                    <a href={c.twitter.startsWith("http") ? c.twitter : `https://twitter.com/${c.twitter}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full border border-foreground/10 text-xs transition-colors hover:border-gold hover:text-gold">
                      TW
                    </a>
                  )}
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
