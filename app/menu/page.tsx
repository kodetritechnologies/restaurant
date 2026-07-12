"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { ShoppingBag, Star, Plus, Minus, X, Package, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BasicProvider from "@/utils/BasicProvider";
import { useCart } from "@/context/CartContext";

function MenuContent() {
  const { getMethod } = BasicProvider();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const initCategory = searchParams.get("category");
  const initSearch = searchParams.get("search");

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(initCategory || "all");
  const [searchQuery, setSearchQuery] = useState<string>(initSearch || "");
  const [settings, setSettings] = useState<any>(null);
  const { items: cartItems, addToCart, updateQuantity, currencySymbol } = useCart();

  useEffect(() => {
    if (initCategory) setActiveCategory(initCategory);
    else setActiveCategory("all");

    if (initSearch) setSearchQuery(initSearch);
    else setSearchQuery("");
  }, [initCategory, initSearch]);

  const scrollContainerRef = useRef<HTMLElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const settingsData = await getMethod("/api/settings");
        if (settingsData?.success) setSettings(settingsData.settings);

        const catData = await getMethod("/api/categories");
        if (catData?.success) {
          setCategories(catData.categories.filter((c: any) => c.type?.toLowerCase() === "product" || !c.type || c.type === "General"));
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = "/api/products?";
        if (activeCategory !== "all") url += `category=${activeCategory}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
        const prodData = await getMethod(url);
        if (prodData?.success) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, searchQuery]);



  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Loader loading={loading} />
      <Header />

      <main className="flex-1 pt-32 pb-24">
        <section className="relative px-5 md:px-8 max-w-7xl mx-auto mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold font-medium tracking-widest uppercase text-sm mb-4 block">
              Discover Our Flavors
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
              Our <span className="text-gradient-gold">Menu</span>
            </h1>
            {searchQuery && (
              <p className="text-gold font-medium mb-4">Showing search results for: "{searchQuery}"</p>
            )}
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our carefully curated selection of dishes, prepared with the finest ingredients and culinary expertise.
            </p>
          </motion.div>
        </section>


        {categories.length > 0 && (
          <div className="sticky top-[64px] sm:top-[72px] md:top-[88px] lg:top-[104px] z-40 bg-background/95 backdrop-blur-xl border-b border-foreground/5 py-4 mb-12 -mt-4 transition-all shadow-sm">
            <div className="relative max-w-7xl mx-auto px-5 md:px-8 group">

              <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-r from-background via-background/90 to-transparent z-10 flex items-center justify-start px-2 pointer-events-none">
                <button
                  onClick={() => scroll("left")}
                  className="pointer-events-auto w-8 h-8 rounded-full bg-surface border border-foreground/10 hover:border-gold hover:text-gold flex items-center justify-center shadow-md transition-colors text-foreground"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-l from-background via-background/90 to-transparent z-10 flex items-center justify-end px-2 pointer-events-none">
                <button
                  onClick={() => scroll("right")}
                  className="pointer-events-auto w-8 h-8 rounded-full bg-surface border border-foreground/10 hover:border-gold hover:text-gold flex items-center justify-center shadow-md transition-colors text-foreground"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <section
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-3 pb-2 -mb-2 snap-x hide-scrollbar px-6 md:px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style dangerouslySetInnerHTML={{
                  __html: `
                  section.hide-scrollbar::-webkit-scrollbar { display: none; }
                `}} />

                <button
                  onClick={() => { setActiveCategory("all"); setSearchQuery(""); router.replace('/menu'); }}
                  className={`shrink-0 snap-start px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === "all" && !searchQuery
                    ? "bg-gold text-primary-foreground shadow-gold"
                    : "bg-surface/50 text-muted-foreground border border-foreground/10 hover:border-gold hover:text-gold"
                    }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { setActiveCategory(cat._id); setSearchQuery(""); router.replace(`/menu?category=${cat._id}`); }}
                    className={`shrink-0 snap-start px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat._id && !searchQuery
                      ? "bg-gold text-primary-foreground shadow-gold"
                      : "bg-surface/50 text-muted-foreground border border-foreground/10 hover:border-gold hover:text-gold"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </section>
            </div>
          </div>
        )}

        <section className="px-5 md:px-8 max-w-7xl mx-auto min-h-[400px]">
          {products.length === 0 && !loading ? (
            <div className="text-center py-20 glass rounded-3xl">
              <ShoppingBag className="w-16 h-16 text-gold/50 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-medium text-foreground mb-2">No Items Available</h3>
              <p className="text-muted-foreground">We are currently updating our menu. Please check back later.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {searchQuery ? (
                <div className="scroll-mt-32">
                  <h2 className="text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-foreground/10 after:h-px after:flex-1 after:bg-foreground/10">
                    <span className="text-gold">Search Results</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AnimatePresence>
                      {products.map((product, index) => {
                        const displayImage = product.productType === "variable" && product.variants?.[0]?.galleryImages?.[0]
                          ? product.variants[0].galleryImages[0]
                          : product.featuredImage;

                        const displayRegularPrice = product.productType === "variable" && product.variants?.[0]
                          ? product.variants[0].regularPrice
                          : product.regularPrice;

                        const displaySalePrice = product.productType === "variable" && product.variants?.[0]
                          ? product.variants[0].salePrice
                          : product.salePrice;

                        return (
                          <motion.div
                            key={product._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass rounded-3xl overflow-hidden group hover:border-gold/30 transition-all duration-500 h-full flex flex-col"
                          >
                            <div
                              className="relative aspect-[4/3] overflow-hidden bg-black/10 flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setSelectedProduct(product);
                                if (product.productType === "variable") {
                                  setSelectedVariant(product.variants?.[0] || null);
                                } else {
                                  setSelectedVariant(null);
                                }
                              }}
                            >
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : (
                                <img
                                  src="/assets/no-image-food.jpg"
                                  alt="No image"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {product.featured && (
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-foreground/10">
                                  <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                  <span className="text-xs font-medium text-white uppercase tracking-wider">Featured</span>
                                </div>
                              )}
                              {displaySalePrice && (
                                <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/50">
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">Sale</span>
                                </div>
                              )}
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <h3
                                  className="text-xl font-serif font-bold text-foreground group-hover:text-gold transition-colors cursor-pointer"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    if (product.productType === "variable") {
                                      setSelectedVariant(product.variants?.[0] || null);
                                    } else {
                                      setSelectedVariant(null);
                                    }
                                  }}
                                >
                                  {product.name}
                                </h3>
                                <div className="text-right shrink-0">
                                  {product.productType === "variable" ? (
                                    <span className="text-gold font-medium flex flex-col">
                                      <span className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Starting at</span>
                                      {currencySymbol}{displaySalePrice ? displaySalePrice.toFixed(2) : displayRegularPrice?.toFixed(2) || "0.00"}
                                    </span>
                                  ) : (
                                    <span className="text-gold font-medium flex items-center gap-2 text-lg">
                                      {displaySalePrice ? (
                                        <>
                                          <span>{currencySymbol}{displaySalePrice.toFixed(2)}</span>
                                          <span className="text-sm text-muted-foreground line-through">{currencySymbol}{displayRegularPrice?.toFixed(2) || "0.00"}</span>
                                        </>
                                      ) : (
                                        <span>{currencySymbol}{displayRegularPrice?.toFixed(2) || "0.00"}</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>


                              <div className="mt-auto pt-4">
                                {product.productType === "variable" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setSelectedVariant(product.variants?.[0] || null);
                                    }}
                                    className="w-full py-3 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                                  >
                                    <Package className="w-4 h-4" />
                                    View Options
                                  </button>
                                ) : (
                                  <div className="flex flex-wrap items-center gap-2 w-full">
                                    {(() => {
                                      const cartItem = cartItems.find((i: any) => (typeof i.productId === 'object' ? i.productId?._id : i.productId) === product._id && !i.variantId);
                                      const qtyInCart = cartItem ? cartItem.quantity : 0;
                                      
                                      if (qtyInCart > 0) {
                                        return (
                                          <div className="flex items-center justify-between bg-gold/10 border border-gold/20 rounded-xl p-1 h-11 flex-1 w-full">
                                            <button
                                              onClick={() => updateQuantity(product._id, null, -1, product.quantity)}
                                              className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                            >
                                              <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-medium text-gold text-center">
                                              {qtyInCart}
                                            </span>
                                            <button
                                              onClick={() => updateQuantity(product._id, null, 1, product.quantity)}
                                              className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                            >
                                              <Plus className="w-4 h-4" />
                                            </button>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <button
                                            onClick={() => addToCart(product, null, 1)}
                                            disabled={product.quantity !== null && product.quantity <= 0}
                                            className="w-full h-11 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <ShoppingBag className="w-4 h-4" />
                                            {product.quantity !== null && product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                                          </button>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                (activeCategory === "all" ? [...categories, { _id: "uncategorized", name: "Others" }] : categories.filter((cat) => cat._id === activeCategory))
                  .map((cat) => {
                    const catProducts = cat._id === "uncategorized"
                      ? products.filter((p) => !p.categories || p.categories.length === 0)
                      : products.filter((p) => p.categories?.includes(cat._id));

                    if (catProducts.length === 0) return null;

                    return (
                      <div key={cat._id} className="scroll-mt-32">
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-foreground/10 after:h-px after:flex-1 after:bg-foreground/10">
                          <span className="text-gold">{cat.name}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <AnimatePresence>
                            {catProducts.map((product, index) => {
                              const displayImage = product.productType === "variable" && product.variants?.[0]?.galleryImages?.[0]
                                ? product.variants[0].galleryImages[0]
                                : product.featuredImage;

                              const displayRegularPrice = product.productType === "variable" && product.variants?.[0]
                                ? product.variants[0].regularPrice
                                : product.regularPrice;

                              const displaySalePrice = product.productType === "variable" && product.variants?.[0]
                                ? product.variants[0].salePrice
                                : product.salePrice;

                              return (
                                <motion.div
                                  key={product._id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.5, delay: index * 0.1 }}
                                  className="glass rounded-3xl overflow-hidden group hover:border-gold/30 transition-all duration-500 h-full flex flex-col"
                                >
                                  <div
                                    className="relative aspect-[4/3] overflow-hidden bg-black/10 flex items-center justify-center cursor-pointer"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      if (product.productType === "variable") {
                                        setSelectedVariant(product.variants?.[0] || null);
                                      } else {
                                        setSelectedVariant(null);
                                      }
                                    }}
                                  >
                                    {displayImage ? (
                                      <img
                                        src={displayImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                      />
                                    ) : (
                                      <img
                                        src="/assets/no-image-food.jpg"
                                        alt="No image"
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                    {product.featured && (
                                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-foreground/10">
                                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                        <span className="text-xs font-medium text-white uppercase tracking-wider">Featured</span>
                                      </div>
                                    )}
                                    {displaySalePrice && (
                                      <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/50">
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">Sale</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                      <h3
                                        className="text-xl font-serif font-bold text-foreground group-hover:text-gold transition-colors cursor-pointer"
                                        onClick={() => {
                                          setSelectedProduct(product);
                                          if (product.productType === "variable") {
                                            setSelectedVariant(product.variants?.[0] || null);
                                          } else {
                                            setSelectedVariant(null);
                                          }
                                        }}
                                      >
                                        {product.name}
                                      </h3>
                                      <div className="text-right shrink-0">
                                        {product.productType === "variable" ? (
                                          <span className="text-gold font-medium flex flex-col">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Starting at</span>
                                            {currencySymbol}{displaySalePrice ? displaySalePrice.toFixed(2) : displayRegularPrice?.toFixed(2) || "0.00"}
                                          </span>
                                        ) : (
                                          <span className="text-gold font-medium flex items-center gap-2 text-lg">
                                            {displaySalePrice ? (
                                              <>
                                                <span>{currencySymbol}{displaySalePrice.toFixed(2)}</span>
                                                <span className="text-sm text-muted-foreground line-through">{currencySymbol}{displayRegularPrice?.toFixed(2) || "0.00"}</span>
                                              </>
                                            ) : (
                                              <span>{currencySymbol}{displayRegularPrice?.toFixed(2) || "0.00"}</span>
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>


                                    <div className="mt-auto pt-4">
                                      {product.productType === "variable" ? (
                                        <button
                                          onClick={() => {
                                            setSelectedProduct(product);
                                            setSelectedVariant(product.variants?.[0] || null);
                                          }}
                                          className="w-full py-3 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                          <Package className="w-4 h-4" />
                                          View Options
                                        </button>
                                      ) : (
                                        <div className="flex flex-wrap items-center gap-2 w-full">
                                          {(() => {
                                            const cartItem = cartItems.find((i: any) => (typeof i.productId === 'object' ? i.productId?._id : i.productId) === product._id && !i.variantId);
                                            const qtyInCart = cartItem ? cartItem.quantity : 0;
                                            
                                            if (qtyInCart > 0) {
                                              return (
                                                <div className="flex items-center justify-between bg-gold/10 border border-gold/20 rounded-xl p-1 h-11 flex-1 w-full">
                                                  <button
                                                    onClick={() => updateQuantity(product._id, null, -1, product.quantity)}
                                                    className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                                  >
                                                    <Minus className="w-4 h-4" />
                                                  </button>
                                                  <span className="font-medium text-gold text-center">
                                                    {qtyInCart}
                                                  </span>
                                                  <button
                                                    onClick={() => updateQuantity(product._id, null, 1, product.quantity)}
                                                    className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                                  >
                                                    <Plus className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              );
                                            } else {
                                              return (
                                                <button
                                                  onClick={() => addToCart(product, null, 1)}
                                                  disabled={product.quantity !== null && product.quantity <= 0}
                                                  className="w-full h-11 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                  <ShoppingBag className="w-4 h-4" />
                                                  {product.quantity !== null && product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                                                </button>
                                              );
                                            }
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-foreground/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md border border-foreground/10"
              >
                <X size={20} />
              </button>

              <div className="relative h-48 sm:h-64 overflow-hidden bg-black/10">
                {selectedVariant?.galleryImages?.[0] || selectedProduct.featuredImage ? (
                  <img
                    src={selectedVariant?.galleryImages?.[0] || selectedProduct.featuredImage}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/assets/no-image-food.jpg"
                    alt="No image"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
              </div>

              <div className="p-6 -mt-8 relative z-10">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-1">
                  {selectedProduct.name}
                </h3>

                {selectedProduct.shortDescription || selectedProduct.description ? (
                  <div
                    className="text-muted-foreground text-sm line-clamp-2 mb-6 prose prose-invert prose-p:m-0 prose-p:inline prose-sm"
                    dangerouslySetInnerHTML={{ __html: selectedProduct.shortDescription || selectedProduct.description }}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm mb-6">Choose your preferred option below.</p>
                )}

                {selectedProduct.productType === "variable" ? (
                  <>
                    <div className="space-y-4 mb-8">
                      <h4 className="text-sm font-medium text-foreground uppercase tracking-wider">Select Option</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.variants?.map((variant: any) => (
                          <button
                            key={variant._id}
                            onClick={() => setSelectedVariant(variant)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedVariant?._id === variant._id
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-foreground/10 hover:border-foreground/30 text-muted-foreground hover:text-white'
                              }`}
                          >
                            {variant.variantName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedVariant && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-foreground/5">
                        <div>
                          <div className="flex items-center gap-2">
                            {selectedVariant.salePrice ? (
                              <>
                                <span className="text-xl font-bold text-gold">{currencySymbol}{selectedVariant.salePrice.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground line-through">{currencySymbol}{selectedVariant.regularPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-gold">{currencySymbol}{selectedVariant.regularPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedVariant.quantity !== null && selectedVariant.quantity <= 5 && selectedVariant.quantity > 0
                              ? `Only ${selectedVariant.quantity} left!`
                              : selectedVariant.quantity === 0 ? 'Out of stock' : 'In stock'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {(() => {
                            const cartItem = cartItems.find((i: any) => (typeof i.productId === 'object' ? i.productId?._id : i.productId) === selectedProduct._id && (typeof i.variantId === 'object' ? i.variantId?._id : i.variantId) === selectedVariant._id);
                            const qtyInCart = cartItem ? cartItem.quantity : 0;
                            
                            if (qtyInCart > 0) {
                              return (
                                <div className="flex items-center justify-between bg-gold/10 border border-gold/20 rounded-xl p-1 h-12 w-32 shrink-0">
                                  <button
                                    onClick={() => updateQuantity(selectedProduct._id, selectedVariant._id, -1, selectedVariant.quantity)}
                                    className="w-10 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-medium text-gold text-lg">{qtyInCart}</span>
                                  <button
                                    onClick={() => updateQuantity(selectedProduct._id, selectedVariant._id, 1, selectedVariant.quantity)}
                                    className="w-10 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <button
                                  onClick={() => {
                                    addToCart(selectedProduct, selectedVariant, 1);
                                  }}
                                  disabled={selectedVariant.quantity !== null && selectedVariant.quantity <= 0}
                                  className="h-12 px-8 flex-1 sm:flex-none rounded-xl border border-gold bg-gold/10 hover:bg-gold/20 text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  Add to Cart
                                </button>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-foreground/5 mt-8">
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedProduct.salePrice ? (
                          <>
                            <span className="text-xl font-bold text-gold">{currencySymbol}{selectedProduct.salePrice.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground line-through">{currencySymbol}{selectedProduct.regularPrice?.toFixed(2) || "0.00"}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gold">{currencySymbol}{selectedProduct.regularPrice?.toFixed(2) || "0.00"}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedProduct.quantity !== null && selectedProduct.quantity <= 5 && selectedProduct.quantity > 0
                          ? `Only ${selectedProduct.quantity} left!`
                          : selectedProduct.quantity === 0 ? 'Out of stock' : 'In stock'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {(() => {
                        const cartItem = cartItems.find((i: any) => (typeof i.productId === 'object' ? i.productId?._id : i.productId) === selectedProduct._id && !i.variantId);
                        const qtyInCart = cartItem ? cartItem.quantity : 0;
                        
                        if (qtyInCart > 0) {
                          return (
                            <div className="flex items-center justify-between bg-gold/10 border border-gold/20 rounded-xl p-1 h-12 w-32 shrink-0">
                              <button
                                onClick={() => updateQuantity(selectedProduct._id, null, -1, selectedProduct.quantity)}
                                className="w-10 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-medium text-gold text-lg">{qtyInCart}</span>
                              <button
                                onClick={() => updateQuantity(selectedProduct._id, null, 1, selectedProduct.quantity)}
                                className="w-10 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => {
                                addToCart(selectedProduct, null, 1);
                              }}
                              disabled={selectedProduct.quantity !== null && selectedProduct.quantity <= 0}
                              className="h-12 px-8 flex-1 sm:flex-none rounded-xl border border-gold bg-gold/10 hover:bg-gold/20 text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Add to Cart
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer settings={settings} />
      <FloatingButtons settings={settings} />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<Loader loading={true} />}>
      <MenuContent />
    </Suspense>
  );
}
