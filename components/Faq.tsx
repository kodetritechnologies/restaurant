"use client";

import { useState } from "react";

const faqs = [
  { q: "How do I make a reservation?", a: "Use our online reservation form or call us directly. We recommend booking 3–5 days in advance for weekend service." },
  { q: "Is parking available?", a: "Complimentary valet parking is provided every evening from 5:30 PM." },
  { q: "Do you offer delivery?", a: "Selected signature dishes are available via our premium delivery partners within the city." },
  { q: "Can I host a private event?", a: "Yes — our chef's table and private dining room seat up to 24 guests with a bespoke tasting menu." },
  { q: "Do you accommodate dietary needs?", a: "Absolutely. Please note allergies or preferences and our chefs will craft a personalised course." },
];

export default function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="bg-surface/50 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="reveal mb-12 text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Frequently Asked</h2>
        </div>
        <div className="grid gap-3">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="reveal overflow-hidden rounded-2xl border border-white/10 bg-card">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-serif text-lg">{f.q}</span>
                  <span className={`text-gold transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-[400ms] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-foreground/70">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
