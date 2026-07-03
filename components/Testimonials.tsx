"use client";

import { useEffect, useState } from "react";

const c1 = "/assets/chef-1.jpg";
const c2 = "/assets/chef-2.jpg";
const c3 = "/assets/chef-3.jpg";

const reviews = [
  { name: "Sophia Bennett", rating: 5, text: "An unforgettable evening. Every course was a masterpiece. The service was impeccable.", img: c2 },
  { name: "James Whitmore", rating: 5, text: "Simply the finest dining experience in the city. The wagyu was extraordinary.", img: c1 },
  { name: "Amelia Chen", rating: 5, text: "The ambience alone is worth the visit — the food elevates it into pure art.", img: c3 },
];

export default function Testimonials() {
  const [reviewIdx, setReviewIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setReviewIdx((i) => (i + 1) % reviews.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="testimonials" className="mx-auto max-w-5xl px-5 py-24 md:px-8 md:py-32">
      <div className="reveal mb-14 text-center">
        <p className="eyebrow">Guests Say</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">Cherished Reviews</h2>
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${reviewIdx * 100}%)` }}
        >
          {reviews.map((r) => (
            <figure key={r.name} className="w-full shrink-0 px-4">
              <div className="glass mx-auto max-w-2xl rounded-3xl p-10 text-center">
                <img src={r.img} alt={r.name} className="mx-auto h-20 w-20 rounded-full border-2 border-gold object-cover" />
                <div className="mt-4 text-gold">{"★".repeat(r.rating)}</div>
                <blockquote className="mt-6 font-serif text-xl italic text-foreground/85 md:text-2xl">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-6 text-sm uppercase tracking-widest text-foreground/60">
                  — {r.name}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setReviewIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === reviewIdx ? "w-8 bg-gold" : "w-4 bg-white/20"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
