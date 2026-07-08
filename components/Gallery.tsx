"use client";

import { useState, useEffect } from "react";

interface GalleryItem {
  _id: string;
  url: string;
  title?: string;
  category?: string;
}

interface GalleryProps {
  gallery?: GalleryItem[] | null;
}

export default function Gallery({ gallery: dbGallery }: GalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    // If parent already passed data, use it directly
    if (dbGallery && dbGallery.length > 0) {
      setItems(dbGallery);
      return;
    }
    // Otherwise fetch directly from the API
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.items)) {
          setItems(data.items);
        }
      })
      .catch(() => { });
  }, [dbGallery]);

  const gallery = items
    .map((item) => ({
      id: item._id,
      src: item.url,
      title: item.title || "",
    }))
    .filter((item) => !!item.src);

  if (gallery.length === 0) return null;

  return (
    <>
      {/* Moments to Savour Grid */}
      <section id="gallery" className="bg-surface/50 py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="reveal mb-14 text-center">
            <p className="eyebrow">Gallery</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Moments to Savour</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setLightbox(g.src)}
                className={`group relative overflow-hidden rounded-2xl ${i % 5 === 0 ? "row-span-2 aspect-square md:aspect-auto" : "aspect-square"
                  }`}
              >
                <img
                  src={g.src}
                  alt={g.title || `Gallery ${i + 1}`}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/assets/no-image-food.jpg";
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/0 transition-colors group-hover:bg-background/30" />
                <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/70 bg-background/50 text-gold backdrop-blur">
                    +
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-background/90 p-6 backdrop-blur-lg"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Close"
            className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full border border-foreground/20 text-gold"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt="Preview"
            className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-[var(--shadow-elegant)]"
          />
        </div>
      )}

      {/* Instagram Grid Section */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="reveal mb-10 text-center">
          <p className="eyebrow">Follow</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">@aurea.dining</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {gallery.slice(0, 6).map((g, i) => (
            <a key={g.id} href="#" className="group relative aspect-square overflow-hidden rounded-xl">
              <img
                src={g.src}
                alt={g.title || "Instagram"}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/assets/no-image-food.jpg";
                }}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 grid place-items-center bg-background/0 text-gold opacity-0 transition-all group-hover:bg-background/50 group-hover:opacity-100">
                ❤
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
