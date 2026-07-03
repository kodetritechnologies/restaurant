"use client";

const d1 = "/assets/dish-1.jpg";
const d2 = "/assets/dish-2.jpg";
const d3 = "/assets/dish-3.jpg";
const d4 = "/assets/dish-4.jpg";
const d5 = "/assets/dish-5.jpg";
const d8 = "/assets/dish-8.jpg";

const categories = [
  { title: "Breakfast", desc: "Morning classics, freshly prepared.", img: d5 },
  { title: "Lunch", desc: "Light plates for a refined midday.", img: d3 },
  { title: "Dinner", desc: "Signature courses under candlelight.", img: d1 },
  { title: "Desserts", desc: "Sweet finales crafted with care.", img: d4 },
  { title: "Coffee", desc: "Single-origin, slow brewed.", img: d8 },
  { title: "Beverages", desc: "Sommelier-curated pairings.", img: d2 },
];

export default function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="reveal mb-14 text-center">
        <p className="eyebrow">Discover</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">Featured Categories</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <article key={c.title} className="reveal group relative overflow-hidden rounded-2xl border border-white/5 bg-surface">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="font-serif text-2xl text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{c.desc}</p>
              <div className="mt-3 h-px w-10 bg-gold transition-all duration-500 group-hover:w-24" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
