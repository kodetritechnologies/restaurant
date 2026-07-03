"use client";

const d1 = "/assets/dish-1.jpg";
const d2 = "/assets/dish-2.jpg";
const d3 = "/assets/dish-3.jpg";
const d4 = "/assets/dish-4.jpg";
const d5 = "/assets/dish-5.jpg";
const d6 = "/assets/dish-6.jpg";
const d7 = "/assets/dish-7.jpg";
const d8 = "/assets/dish-8.jpg";

const dishes = [
  { name: "Wagyu Ribeye", desc: "Aged 45 days, black truffle jus", price: 84, img: d1 },
  { name: "Seared Scallops", desc: "Saffron beurre blanc, sea herbs", price: 46, img: d2 },
  { name: "Tartufo Linguine", desc: "House-made pasta, winter truffle", price: 52, img: d3 },
  { name: "Molten Chocolate", desc: "Valrhona 70%, edible gold leaf", price: 22, img: d4 },
  { name: "Atlantic Salmon", desc: "Charred lemon, thyme, olive tapenade", price: 38, img: d5 },
  { name: "Beef Tartare", desc: "Hand-cut, quail egg, capers", price: 34, img: d6 },
  { name: "Omakase Selection", desc: "Chef's daily eight-piece", price: 68, img: d7 },
  { name: "Smoked Negroni", desc: "Applewood, orange zest, gold rim", price: 24, img: d8 },
];

export default function Menu() {
  return (
    <section id="menu" className="bg-surface/50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mb-14 text-center">
          <p className="eyebrow">Chef's Selection</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Signature Dishes</h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/65">
            Eight timeless creations, each plated with intention and paired for the season.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dishes.map((d) => (
            <article key={d.name} className="reveal group overflow-hidden rounded-2xl border border-white/5 bg-card hover-lift">
              <div className="aspect-square overflow-hidden">
                <img
                  src={d.img}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl">{d.name}</h3>
                  <span className="shrink-0 font-serif text-lg text-gold">${d.price}</span>
                </div>
                <p className="mt-2 text-sm text-foreground/65">{d.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
