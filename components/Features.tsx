"use client";

const features = [
  { icon: "🌿", title: "Fresh Organic Ingredients", desc: "Sourced daily from local farms." },
  { icon: "👨‍🍳", title: "Expert Chefs", desc: "Michelin-trained, endlessly curious." },
  { icon: "⚡", title: "Fast Service", desc: "Refined pacing, effortless flow." },
  { icon: "✨", title: "Luxury Ambience", desc: "Candlelight, velvet, warm gold." },
  { icon: "📅", title: "Online Reservation", desc: "Book your table in seconds." },
  { icon: "💛", title: "Best Experience", desc: "A night you'll remember forever." },
];

export default function Features() {
  return (
    <section className="bg-surface/50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mb-14 text-center">
          <p className="eyebrow">Why Auréa</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Reasons to Choose Us</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="reveal glass rounded-2xl p-8 hover-lift">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-gold/10 text-2xl">{f.icon}</div>
              <h3 className="mt-6 font-serif text-2xl">{f.title}</h3>
              <p className="mt-3 text-sm text-foreground/65">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
