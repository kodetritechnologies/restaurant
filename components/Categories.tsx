"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  featured?: boolean;
  type?: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?type=product&featured=true");
        const data = await res.json();
        if (data && data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch featured categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section id="categories" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-32 flex justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }



  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-32">
      <div className="reveal mb-14 text-center">
        <p className="eyebrow">Discover</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">Featured Categories</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <article key={c._id} className="reveal group relative overflow-hidden rounded-2xl border border-foreground/5 bg-surface">
            <div className="aspect-[4/3] overflow-hidden relative">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full bg-surface/50 flex items-center justify-center text-gold">
                  <span className="text-4xl">✨</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 z-10 pointer-events-none">
              <h3 className="font-serif text-2xl text-foreground">{c.name}</h3>
              {c.description && (
                <p className="mt-1 text-sm text-foreground/70">{c.description}</p>
              )}
              <div className="mt-3 h-px w-10 bg-gold transition-all duration-500 group-hover:w-24" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
