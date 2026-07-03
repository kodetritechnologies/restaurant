"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 20, suffix: "+", label: "Professional Chefs" },
  { value: 50, suffix: "+", label: "Premium Dishes" },
  { value: 15, suffix: "k+", label: "Happy Customers" },
  { value: 12, suffix: "+", label: "Years Experience" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1600;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setN(Math.floor(p * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="font-serif text-5xl md:text-6xl text-gradient-gold">
      {n}{suffix}
    </div>
  );
}

export default function Stats() {
  return (
    <section className="bg-surface/50 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        {stats.map((s) => (
          <div key={s.label} className="reveal text-center">
            <Counter value={s.value} suffix={s.suffix} />
            <p className="mt-2 text-xs uppercase tracking-widest text-foreground/60">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
