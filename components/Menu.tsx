"use client";

import { useEffect, useState } from "react";
import BasicProvider from "@/utils/BasicProvider";
import { ShoppingBag, Minus, Plus } from "lucide-react";

export default function Menu() {
  const { getMethod } = BasicProvider();

  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, currData] = await Promise.all([
          getMethod("/api/products?signature=true&limit=8"),
          getMethod("/api/currency")
        ]);

        if (prodData && prodData.success) {
          setDishes(prodData.products);
        }

        if (currData?.success && currData.currencies) {
          const defaultCurr = currData.currencies.find((c: any) => c.isDefault);
          if (defaultCurr) setCurrencySymbol(defaultCurr.symbol);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="bg-surface/50 py-16 md:py-32 flex justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (dishes.length === 0) return null;

  return (
    <section id="menu" className="bg-surface/50 py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal mb-14 text-center">
          <p className="eyebrow">Chef's Selection</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Signature Dishes</h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/65">
            Our most celebrated creations, each plated with intention and paired for the season.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dishes.map((d) => (
            <article
              key={d._id}
              className="reveal group overflow-hidden rounded-2xl border border-foreground/5 bg-card hover-lift"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={d.featuredImage || "/assets/no-image-food.jpg"}
                  alt={d.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/assets/no-image-food.jpg";
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl">{d.name}</h3>
                  <span className="shrink-0 font-serif text-lg text-gold">
                    {d.salePrice ? (
                      <>
                        <span className="line-through text-foreground/40 text-sm mr-1">{currencySymbol}{d.regularPrice}</span>
                        {currencySymbol}{d.salePrice}
                      </>
                    ) : (
                      `${currencySymbol}${d.regularPrice}`
                    )}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 w-full">
                  <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1 h-11 flex-1 min-w-[100px] shrink-0">
                    <button
                      className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-foreground text-center">
                      1
                    </span>
                    <button
                      className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    className="flex-[2] min-w-[130px] h-11 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
