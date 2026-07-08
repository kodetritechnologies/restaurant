"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Package, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  products: any[];
  categories: any[];
}

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
      
      // Fetch dynamic currency symbol
      fetch("/api/currency")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data.currencies) {
            const defaultCurr = data.currencies.find((c: any) => c.isDefault) || data.currencies[0];
            if (defaultCurr) setCurrencySymbol(defaultCurr.symbol);
          }
        })
        .catch(console.error);
    } else {
      setQuery("");
      setResults({ products: [], categories: [] });
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.trim().length < 2) {
        setResults({ products: [], categories: [] });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults({ products: data.products || [], categories: data.categories || [] });
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center p-4 sm:p-10 pt-[10vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-surface border border-foreground/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Search Input */}
            <div className="relative flex items-center p-4 border-b border-foreground/10">
              <Search className="w-5 h-5 text-muted-foreground ml-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for dishes, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-lg text-foreground placeholder:text-muted-foreground/60"
              />
              {loading && <Loader2 className="w-5 h-5 text-gold animate-spin mr-2 shrink-0" />}
              <button onClick={onClose} className="p-2 rounded-full hover:bg-foreground/5 transition-colors shrink-0">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {query.trim().length > 0 && query.trim().length < 2 && (
                <p className="text-center text-muted-foreground py-8 text-sm">Please type at least 2 characters...</p>
              )}

              {!loading && query.trim().length >= 2 && results.products.length === 0 && results.categories.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">No results found for "{query}"</p>
                </div>
              )}

              {(results.categories.length > 0 || results.products.length > 0) && (
                <div className="space-y-6">
                  
                  {/* Categories Section */}
                  {results.categories.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold pb-2 border-b border-foreground/5">
                        <LayoutGrid className="w-4 h-4" /> Categories
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {results.categories.map((cat) => (
                          <div
                            key={cat._id}
                            onClick={() => { onClose(); router.push(`/menu?category=${cat._id}`); }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 cursor-pointer transition-colors border border-transparent hover:border-foreground/10 group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-foreground/5 overflow-hidden shrink-0 relative">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">📁</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{cat.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{cat.description || "Category"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Section */}
                  {results.products.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold pb-2 border-b border-foreground/5">
                        <Package className="w-4 h-4" /> Dishes
                      </h3>
                      <div className="flex flex-col gap-2">
                        {results.products.map((prod) => (
                          <div
                            key={prod._id}
                            onClick={() => { onClose(); router.push(`/menu?search=${encodeURIComponent(prod.name)}`); }}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-foreground/5 cursor-pointer transition-colors border border-transparent hover:border-foreground/10 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg bg-foreground/5 overflow-hidden shrink-0 relative">
                                {prod.featuredImage ? (
                                  <img src={prod.featuredImage} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                                )}
                              </div>
                              <div className="min-w-0 pr-4">
                                <p className="font-semibold text-foreground truncate">{prod.name}</p>
                                {prod.shortDescription && (
                                  <div className="text-xs text-muted-foreground line-clamp-1" dangerouslySetInnerHTML={{ __html: prod.shortDescription }} />
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 text-right pl-2">
                              <span className="text-sm font-bold text-gold whitespace-nowrap">
                                {currencySymbol}{prod.salePrice || prod.regularPrice}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-foreground/5 bg-foreground/5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Press ESC to close</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
