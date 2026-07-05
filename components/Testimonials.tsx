"use client";

import { useEffect, useState } from "react";

interface TestimonialProps {
  reviews?: {
    _id: string;
    name: string;
    rating: number;
    text: string;
    imgUrl: string;
  }[] | null;
}

export default function Testimonials({ reviews: dbReviews }: TestimonialProps) {
  const [reviewIdx, setReviewIdx] = useState(0);

  const displayReviews = dbReviews || [];

  useEffect(() => {
    if (displayReviews.length === 0) return;
    const id = setInterval(() => setReviewIdx((i) => (i + 1) % displayReviews.length), 5000);
    return () => clearInterval(id);
  }, [displayReviews.length]);

  if (displayReviews.length === 0) {
    return (
      <section id="testimonials" className="mx-auto max-w-5xl px-5 py-24 md:px-8 md:py-32">
        <div className="reveal mb-14 text-center">
          <p className="eyebrow">Guests Say</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Cherished Reviews</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="mx-auto max-w-5xl px-5 py-24 md:px-8 md:py-32">
      <div className="reveal mb-14 text-center">
        <p className="eyebrow">Guests Say</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">Cherished Reviews</h2>
      </div>
      <div className="relative overflow-hidden reveal">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${reviewIdx * 100}%)` }}
        >
          {displayReviews.map((r) => (
            <figure key={r._id} className="w-full shrink-0 px-4">
              <div className="glass mx-auto max-w-2xl rounded-3xl p-10 text-center">
                <img src={r.imgUrl} alt={r.name} className="mx-auto h-20 w-20 rounded-full border-2 border-gold object-cover" />
                <div className="mt-4 text-gold text-sm tracking-widest">{"★".repeat(r.rating)}</div>
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
          {displayReviews.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setReviewIdx(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === reviewIdx ? "w-8 bg-gold" : "w-4 bg-white/20"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
