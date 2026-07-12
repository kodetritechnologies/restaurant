"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BasicProvider from "@/utils/BasicProvider";
import { ShoppingBag, Minus, Plus, X, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Menu() {
  const { getMethod } = BasicProvider();

  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

  const { items: cartItems, subtotalAmount, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, currData] = await Promise.all([
          getMethod("/api/products?signature=true&limit=8"),
          getMethod("/api/currency?default=true")
        ]);

        if (prodData && prodData.success) {
          setDishes(prodData.products);
        }

        if (currData?.success && currData.currency) {
          setCurrencySymbol(currData.currency.symbol);
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
      <section id="menu" className="bg-surface/50 py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-14 text-center">
            <div className="h-4 bg-foreground/10 rounded w-32 mx-auto mb-4 animate-pulse" />
            <div className="h-10 bg-foreground/10 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-5 bg-foreground/10 rounded w-96 mx-auto animate-pulse max-w-full" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <article key={i} className="overflow-hidden rounded-2xl border border-foreground/5 bg-card flex flex-col h-full animate-pulse">
                <div className="aspect-[4/3] bg-foreground/10" />
                <div className="p-4 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="h-6 bg-foreground/10 rounded w-2/3" />
                    <div className="h-6 bg-foreground/10 rounded w-1/4" />
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="h-11 bg-foreground/10 rounded-xl w-full" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
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
          {dishes.map((d) => {
            const displayImage = d.productType === "variable" && d.variants?.[0]?.galleryImages?.[0]
              ? d.variants[0].galleryImages[0]
              : d.featuredImage;

            const displayRegularPrice = d.productType === "variable" && d.variants?.[0]
              ? d.variants[0].regularPrice
              : d.regularPrice;

            const displaySalePrice = d.productType === "variable" && d.variants?.[0]
              ? d.variants[0].salePrice
              : d.salePrice;

            return (
              <article
                key={d._id}
                className="reveal group overflow-hidden rounded-2xl border border-foreground/5 bg-card hover-lift flex flex-col h-full"
              >
                <div
                  className="aspect-[4/3] overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(d);
                    if (d.productType === "variable") {
                      setSelectedVariant(d.variants?.[0] || null);
                    } else {
                      setSelectedVariant(null);
                    }
                  }}
                >
                  <img
                    src={displayImage || "/assets/no-image-food.jpg"}
                    alt={d.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/no-image-food.jpg";
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="font-serif text-xl cursor-pointer hover:text-gold transition-colors"
                      onClick={() => {
                        setSelectedProduct(d);
                        if (d.productType === "variable") {
                          setSelectedVariant(d.variants?.[0] || null);
                        } else {
                          setSelectedVariant(null);
                        }
                      }}
                    >
                      {d.name}
                    </h3>
                    <div className="text-right shrink-0">
                      {d.productType === "variable" ? (
                        <span className="text-gold font-serif text-lg flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Starting at</span>
                          {currencySymbol}{displaySalePrice ? displaySalePrice.toFixed(2) : displayRegularPrice?.toFixed(2) || "0.00"}
                        </span>
                      ) : (
                        <span className="shrink-0 font-serif text-lg text-gold">
                          {displaySalePrice ? (
                            <>
                              <span className="line-through text-foreground/40 text-sm mr-1">{currencySymbol}{displayRegularPrice?.toFixed(2)}</span>
                              {currencySymbol}{displaySalePrice.toFixed(2)}
                            </>
                          ) : (
                            `${currencySymbol}${displayRegularPrice?.toFixed(2) || "0.00"}`
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    {d.productType === "variable" ? (
                      <button
                        onClick={() => {
                          setSelectedProduct(d);
                          setSelectedVariant(d.variants?.[0] || null);
                        }}
                        className="w-full py-2.5 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        View Options
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        {(() => {
                          const cartItem = cartItems.find((i: any) => (typeof i.productId === 'object' ? i.productId?._id : i.productId) === d._id && !i.variantId);
                          const qtyInCart = cartItem ? cartItem.quantity : 0;

                          if (qtyInCart > 0) {
                            return (
                              <div className="flex items-center justify-between bg-gold/10 border border-gold/20 rounded-xl p-1 h-11 flex-1 w-full">
                                <button
                                  onClick={() => updateQuantity(d._id, null, -1, d.quantity)}
                                  className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-medium text-gold text-center">
                                  {qtyInCart}
                                </span>
                                <button
                                  onClick={() => updateQuantity(d._id, null, 1, d.quantity)}
                                  className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-gold transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          } else {
                            return (
                              <button
                                onClick={() => addToCart(d, null, 1)}
                                disabled={d.quantity !== null && d.quantity <= 0}
                                className="w-full h-11 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingBag className="w-4 h-4" />
                                {d.quantity !== null && d.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                              </button>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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
    </section>
  );
}
