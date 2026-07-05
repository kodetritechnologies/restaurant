"use client";

import { useState } from "react";

interface FaqProps {
  faqs?: {
    _id: string;
    question: string;
    answer: string;
  }[] | null;
}

export default function Faq({ faqs: dbFaqs }: FaqProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const displayFaqs = dbFaqs || [];
  return (
    <section className="bg-surface/50 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="reveal mb-12 text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Frequently Asked</h2>
        </div>
        <div className="grid gap-3">
          {displayFaqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f._id} className="reveal overflow-hidden rounded-2xl border border-white/10 bg-card">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-serif text-lg">{f.question}</span>
                  <span className={`text-gold transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-[400ms] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-foreground/70">{f.answer}</p>
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
