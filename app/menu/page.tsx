"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { ShoppingBag, Star, Plus, Minus, X, Package } from "lucide-react";

export default function MenuPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [settings, setSettings] = useState<any>(null);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");

  // Cart State
  const [cartItems, setCartItems] = useState<{ productId: string, variantId?: string, quantity: number }[]>([]);
  
  // Variant Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);

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
        const url = activeCategory === "all" 
          ? "/api/products?status=active" 
          : `/api/products?status=active&category=${activeCategory}`;
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
  }, [activeCategory]);



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
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our carefully curated selection of dishes, prepared with the finest ingredients and culinary expertise.
            </p>
          </motion.div>
        </section>


        {/* Categories Filter */}
        {categories.length > 0 && (
          <section className="px-5 md:px-8 max-w-7xl mx-auto mb-12 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === "all"
                  ? "bg-gold text-primary-foreground shadow-gold"
                  : "bg-surface/50 text-muted-foreground border border-white/10 hover:border-gold hover:text-gold"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat._id
                    ? "bg-gold text-primary-foreground shadow-gold"
                    : "bg-surface/50 text-muted-foreground border border-white/10 hover:border-gold hover:text-gold"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </section>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className="glass rounded-3xl overflow-hidden group hover:border-gold/30 transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-black/10 flex items-center justify-center">
                      {displayImage ? (
                        <img 
                          src={displayImage} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <ShoppingBag className="w-12 h-12 text-white/10" />
                      )}
                      {product.featured && (
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
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
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-gold transition-colors">
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
                      
                      {product.shortDescription || product.description ? (
                        <div 
                          className="text-muted-foreground text-sm line-clamp-2 mt-2 leading-relaxed prose prose-invert prose-p:m-0 prose-p:inline prose-sm"
                          dangerouslySetInnerHTML={{ __html: product.shortDescription || product.description }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-2 leading-relaxed">
                          A delicious culinary experience crafted with passion.
                        </p>
                      )}
                      
                      {/* Actions */}
                      <div className="mt-6">
                        {product.productType === "variable" ? (
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setSelectedVariant(product.variants?.[0] || null);
                              setModalQuantity(1);
                            }}
                            className="w-full py-3 rounded-xl border border-white/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            View Options
                          </button>
                        ) : (
                          getCartQuantity(product._id) > 0 ? (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-1.5 h-12">
                              <button 
                                onClick={() => updateCartQuantity(product._id, undefined, -1, product.quantity)}
                                className="w-10 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-medium text-foreground w-8 text-center">{getCartQuantity(product._id)}</span>
                              <button 
                                onClick={() => updateCartQuantity(product._id, undefined, 1, product.quantity)}
                                className="w-10 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => updateCartQuantity(product._id, undefined, 1, product.quantity)}
                              disabled={product.quantity !== null && product.quantity <= 0}
                              className="w-full h-12 rounded-xl border border-white/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              {product.quantity !== null && product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
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
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="relative h-48 sm:h-64 overflow-hidden bg-black/10">
                <img 
                  src={selectedVariant?.galleryImages?.[0] || selectedProduct.featuredImage} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
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

                <div className="space-y-4 mb-8">
                  <h4 className="text-sm font-medium text-foreground uppercase tracking-wider">Select Option</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants?.map((variant: any) => (
                      <button
                        key={variant._id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          selectedVariant?._id === variant._id 
                          ? 'border-gold bg-gold/10 text-gold' 
                          : 'border-white/10 hover:border-white/30 text-muted-foreground hover:text-white'
                        }`}
                      >
                        {variant.variantName}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedVariant && (
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
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
                      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-1.5 h-12 w-28">
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
