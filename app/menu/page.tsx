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

function MenuContent() {
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
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");

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

  // Cart State
  const [cartItems, setCartItems] = useState<{ productId: string, variantId?: string, quantity: number }[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Variant Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});

  // Cart Drawer State
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getCartQuantity = (productId: string, variantId?: string) => {
    const item = cartItems.find(i => i.productId === productId && i.variantId === variantId);
    return item ? item.quantity : 0;
  };

  const updateCartQuantity = (productId: string, variantId: string | undefined, delta: number, maxStock: number | null) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.productId === productId && i.variantId === variantId);
      let newQuantity = existingItem ? existingItem.quantity + delta : delta;

      if (newQuantity < 0) newQuantity = 0;
      if (maxStock !== null && maxStock !== undefined && newQuantity > maxStock) newQuantity = maxStock;

      if (newQuantity === 0) {
        return prev.filter(i => !(i.productId === productId && i.variantId === variantId));
      }

      if (existingItem) {
        return prev.map(i =>
          (i.productId === productId && i.variantId === variantId) ? { ...i, quantity: newQuantity } : i
        );
      }

      return [...prev, { productId, variantId, quantity: newQuantity }];
    });
  };

  // Persist cart to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems, cartLoaded]);

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cartItems");
      if (stored) setCartItems(JSON.parse(stored));
    } catch { }
    setCartLoaded(true);
  }, []);

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const getCartSubtotal = () => {
    let total = 0;
    cartItems.forEach(item => {
      const product = products.find(p => p._id === item.productId);
      if (!product) return;

      if (product.productType === "variable" && item.variantId) {
        const variant = product.variants?.find((v: any) => v._id === item.variantId);
        if (variant) {
          total += (variant.salePrice || variant.regularPrice) * item.quantity;
        }
      } else {
        total += (product.salePrice || product.regularPrice) * item.quantity;
      }
    });
    return total;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const settingsRes = await fetch("/api/settings");
        const settingsData = await settingsRes.json();
        if (settingsData?.success) setSettings(settingsData.settings);

        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        if (catData?.success) {
          setCategories(catData.categories.filter((c: any) => c.type?.toLowerCase() === "product" || !c.type || c.type === "General"));
        }

        const currRes = await fetch("/api/currency");
        const currData = await currRes.json();
        if (currData?.success && currData.currencies) {
          const defaultCurr = currData.currencies.find((c: any) => c.isDefault);
          if (defaultCurr) setCurrencySymbol(defaultCurr.symbol);
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
        const prodRes = await fetch(url);
        const prodData = await prodRes.json();
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
        {/* Hero Section */}
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


        {/* Categories Filter Slider */}
        {categories.length > 0 && (
          <div className="sticky top-[64px] sm:top-[72px] md:top-[88px] lg:top-[104px] z-40 bg-background/95 backdrop-blur-xl border-b border-foreground/5 py-4 mb-12 -mt-4 transition-all shadow-sm">
            <div className="relative max-w-7xl mx-auto px-5 md:px-8 group">
              
              {/* Left Scroll Button */}
              <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-r from-background via-background/90 to-transparent z-10 flex items-center justify-start px-2 pointer-events-none">
                <button 
                  onClick={() => scroll("left")}
                  className="pointer-events-auto w-8 h-8 rounded-full bg-surface border border-foreground/10 hover:border-gold hover:text-gold flex items-center justify-center shadow-md transition-colors text-foreground"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Right Scroll Button */}
              <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-l from-background via-background/90 to-transparent z-10 flex items-center justify-end px-2 pointer-events-none">
                <button 
                  onClick={() => scroll("right")}
                  className="pointer-events-auto w-8 h-8 rounded-full bg-surface border border-foreground/10 hover:border-gold hover:text-gold flex items-center justify-center shadow-md transition-colors text-foreground"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Container */}
              <section 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-3 pb-2 -mb-2 snap-x hide-scrollbar px-6 md:px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style dangerouslySetInnerHTML={{__html: `
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

        {/* Menu Grid */}
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
                            {/* Image */}
                            <div 
                              className="relative aspect-[4/3] overflow-hidden bg-black/10 flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setSelectedProduct(product);
                                if (product.productType === "variable") {
                                  setSelectedVariant(product.variants?.[0] || null);
                                } else {
                                  setSelectedVariant(null);
                                }
                                setModalQuantity(1);
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

                            {/* Content */}
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
                                    setModalQuantity(1);
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


                              {/* Actions */}
                              <div className="mt-auto pt-4">
                                {product.productType === "variable" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setSelectedVariant(product.variants?.[0] || null);
                                      setModalQuantity(1);
                                    }}
                                    className="w-full py-3 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                                  >
                                    <Package className="w-4 h-4" />
                                    View Options
                                  </button>
                                ) : (
                                  <div className="flex flex-wrap items-center gap-2 w-full">
                                    <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1 h-11 flex-1 min-w-[100px] shrink-0">
                                      <button
                                        onClick={() => setLocalQuantities(prev => ({ ...prev, [product._id]: Math.max(1, (prev[product._id] || 1) - 1) }))}
                                        className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="font-medium text-foreground text-center">
                                        {localQuantities[product._id] || 1}
                                      </span>
                                      <button
                                        onClick={() => {
                                          const current = localQuantities[product._id] || 1;
                                          const max = product.quantity !== null ? product.quantity : 99;
                                          setLocalQuantities(prev => ({ ...prev, [product._id]: Math.min(max, current + 1) }));
                                        }}
                                        className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => {
                                        const qtyToAdd = localQuantities[product._id] || 1;
                                        updateCartQuantity(product._id, undefined, qtyToAdd, product.quantity);
                                        toast.success(`Added ${qtyToAdd} to cart`);
                                      }}
                                      disabled={product.quantity !== null && product.quantity <= 0}
                                      className="flex-[2] min-w-[130px] h-11 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <ShoppingBag className="w-4 h-4" />
                                      {product.quantity !== null && product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                                    </button>
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
                                  {/* Image */}
                                  <div 
                                    className="relative aspect-[4/3] overflow-hidden bg-black/10 flex items-center justify-center cursor-pointer"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      if (product.productType === "variable") {
                                        setSelectedVariant(product.variants?.[0] || null);
                                      } else {
                                        setSelectedVariant(null);
                                      }
                                      setModalQuantity(1);
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

                                  {/* Content */}
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
                                      setModalQuantity(1);
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


                                    {/* Actions */}
                                    <div className="mt-auto pt-4">
                                      {product.productType === "variable" ? (
                                        <button
                                          onClick={() => {
                                            setSelectedProduct(product);
                                            setSelectedVariant(product.variants?.[0] || null);
                                            setModalQuantity(1);
                                          }}
                                          className="w-full py-3 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                                        >
                                          <Package className="w-4 h-4" />
                                          View Options
                                        </button>
                                      ) : (
                                        <div className="flex flex-wrap items-center gap-2 w-full">
                                          <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1 h-11 flex-1 min-w-[100px] shrink-0">
                                            <button
                                              onClick={() => setLocalQuantities(prev => ({ ...prev, [product._id]: Math.max(1, (prev[product._id] || 1) - 1) }))}
                                              className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                                            >
                                              <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-medium text-foreground text-center">
                                              {localQuantities[product._id] || 1}
                                            </span>
                                            <button
                                              onClick={() => {
                                                const current = localQuantities[product._id] || 1;
                                                const max = product.quantity !== null ? product.quantity : 99;
                                                setLocalQuantities(prev => ({ ...prev, [product._id]: Math.min(max, current + 1) }));
                                              }}
                                              className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                                            >
                                              <Plus className="w-4 h-4" />
                                            </button>
                                          </div>

                                          <button
                                            onClick={() => {
                                              const qtyToAdd = localQuantities[product._id] || 1;
                                              updateCartQuantity(product._id, undefined, qtyToAdd, product.quantity);
                                              toast.success(`Added ${qtyToAdd} to cart`);
                                            }}
                                            disabled={product.quantity !== null && product.quantity <= 0}
                                            className="flex-[2] min-w-[130px] h-11 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <ShoppingBag className="w-4 h-4" />
                                            {product.quantity !== null && product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                                          </button>
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

      {/* Variant Selection Modal */}
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
                      <div className="flex items-center justify-between pt-6 border-t border-foreground/5">
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

                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1.5 h-12 w-28">
                            <button
                              onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                              className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium text-foreground">{modalQuantity}</span>
                            <button
                              onClick={() => setModalQuantity(selectedVariant.quantity !== null ? Math.min(selectedVariant.quantity, modalQuantity + 1) : modalQuantity + 1)}
                              className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              updateCartQuantity(selectedProduct._id, selectedVariant._id, modalQuantity, selectedVariant.quantity);
                              toast.success(`Added ${modalQuantity} to cart`);
                              setSelectedProduct(null); // Close modal after adding
                            }}
                            disabled={selectedVariant.quantity !== null && selectedVariant.quantity <= 0}
                            className="h-12 px-6 rounded-xl border border-gold bg-gold/10 hover:bg-gold/20 text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between pt-6 border-t border-foreground/5 mt-8">
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

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1.5 h-12 w-28">
                        <button
                          onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                          className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-foreground">{modalQuantity}</span>
                        <button
                          onClick={() => setModalQuantity(selectedProduct.quantity !== null ? Math.min(selectedProduct.quantity, modalQuantity + 1) : modalQuantity + 1)}
                          className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => {
                          updateCartQuantity(selectedProduct._id, undefined, modalQuantity, selectedProduct.quantity);
                          toast.success(`Added ${modalQuantity} to cart`);
                          setSelectedProduct(null); // Close modal after adding
                        }}
                        disabled={selectedProduct.quantity !== null && selectedProduct.quantity <= 0}
                        className="h-12 px-6 rounded-xl border border-gold bg-gold/10 hover:bg-gold/20 text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      {cartTotalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 left-6 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-gold text-primary-foreground shadow-lg transition-transform hover:scale-110 md:bottom-6 md:left-6"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow">
            {cartTotalItems}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-[#111] border-l border-foreground/10 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-foreground/10 bg-foreground/5 shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-gold" />
                  Your Order
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-muted-foreground hover:text-white hover:bg-foreground/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-white mb-1">Your cart is empty</p>
                    <p className="text-sm">Looks like you haven't added anything yet.</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => {
                    const product = products.find(p => p._id === item.productId);
                    if (!product) return null;

                    let title = product.name;
                    let price = product.salePrice || product.regularPrice;
                    let image = product.featuredImage;
                    let variantName = "";
                    let maxStock = product.quantity;

                    if (product.productType === "variable" && item.variantId) {
                      const variant = product.variants?.find((v: any) => v._id === item.variantId);
                      if (variant) {
                        variantName = variant.variantName;
                        price = variant.salePrice || variant.regularPrice;
                        if (variant.galleryImages?.[0]) image = variant.galleryImages[0];
                        maxStock = variant.quantity;
                      }
                    }

                    return (
                      <div key={`${item.productId}-${item.variantId || idx}`} className="flex gap-4 p-4 rounded-2xl bg-foreground/5 border border-foreground/5 relative group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black/20">
                          <img src={image || "/assets/no-image-food.jpg"} alt={title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-bold text-white text-sm line-clamp-1">{title}</h4>
                          {variantName && (
                            <p className="text-xs text-muted-foreground mt-0.5">{variantName}</p>
                          )}
                          <div className="text-gold font-bold text-sm mt-1">
                            {currencySymbol}{(price * item.quantity).toFixed(2)}
                          </div>

                          <div className="flex items-center justify-between bg-black/40 border border-foreground/10 rounded-lg p-1 h-8 w-24 mt-3">
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.variantId, -1, maxStock)}
                              className="w-6 h-full rounded hover:bg-foreground/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.variantId, 1, maxStock)}
                              className="w-6 h-full rounded hover:bg-foreground/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => updateCartQuantity(item.productId, item.variantId, -item.quantity, maxStock)}
                          className="absolute top-2 right-2 p-1.5 text-muted-foreground opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-red-400 hover:bg-red-400/10 rounded-md"
                          title="Remove item"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer / Checkout */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-foreground/10 bg-[#111] shrink-0">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-2xl font-bold text-gold">{currencySymbol}{getCartSubtotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/checkout");
                    }}
                    className="w-full h-14 rounded-xl bg-gold text-primary-foreground font-bold text-lg hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
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
