"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BasicProvider from "@/utils/BasicProvider";

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  featured?: boolean;
  type?: string;
}

export default function Features() {
  const { getMethod } = BasicProvider();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getMethod("/api/categories?featured=true&type=product");
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
      <section className="bg-surface/50 py-16 md:py-32 flex justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }



  return (
    <section className="bg-surface/50 py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mb-14 text-center">
          <p className="eyebrow">Discover Our</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Featured Offerings</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c._id} className="reveal glass rounded-2xl p-6 hover-lift flex flex-col">
              <div className="relative h-48 w-full mb-6 rounded-xl overflow-hidden shadow-md">
                <Image 
                  src={c.image || "/assets/no-image-food.jpg"} 
                  alt={c.name} 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <h3 className="font-serif text-2xl text-foreground">{c.name}</h3>
              {c.description && (
                <p className="mt-3 text-sm text-foreground/65 flex-grow leading-relaxed">
                  {c.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
