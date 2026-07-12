"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BasicProvider from "@/utils/BasicProvider";
import { ShoppingBag, Minus, Plus, X, Package, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Menu() {
  const { getMethod } = BasicProvider();
  const router = useRouter();

  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItems: any[] = [];
  const cartTotalItems = 0;
  const getCartSubtotal = () => 0;

  const updateCartQuantity = (productId: string, variantId: string | undefined, delta: number, maxStock: number | null) => {
    toast.success("Cart functionality will be implemented via API soon!");
  };

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
                    setModalQuantity(1);
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
                        setModalQuantity(1);
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
                          setModalQuantity(1);
                        }}
                        className="w-full py-2.5 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        View Options
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1 h-11 flex-1 min-w-[100px] shrink-0">
                          <button
                            onClick={() => setLocalQuantities(prev => ({ ...prev, [d._id]: Math.max(1, (prev[d._id] || 1) - 1) }))}
                            className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-foreground text-center">
                            {localQuantities[d._id] || 1}
                          </span>
                          <button
                            onClick={() => {
                              const current = localQuantities[d._id] || 1;
                              const max = d.quantity !== null ? d.quantity : 99;
                              setLocalQuantities(prev => ({ ...prev, [d._id]: Math.min(max, current + 1) }));
                            }}
                            className="w-8 h-full rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-foreground transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            const qtyToAdd = localQuantities[d._id] || 1;
                            updateCartQuantity(d._id, undefined, qtyToAdd, d.quantity);
                            toast.success(`Added ${qtyToAdd} to cart`);
                          }}
                          disabled={d.quantity !== null && d.quantity <= 0}
                          className="flex-[2] min-w-[130px] h-11 rounded-xl border border-foreground/10 hover:border-gold hover:bg-gold/5 text-foreground hover:text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {d.quantity !== null && d.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
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
                          <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1.5 h-12 w-28 shrink-0">
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
                            className="h-12 px-6 flex-1 sm:flex-none rounded-xl border border-gold bg-gold/10 hover:bg-gold/20 text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add
                          </button>
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
                      <div className="flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-xl p-1.5 h-12 w-28 shrink-0">
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
                        className="h-12 px-6 flex-1 sm:flex-none rounded-xl border border-gold bg-gold/10 hover:bg-gold/20 text-gold transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-white mb-1">Your cart is empty</p>
                    <p className="text-sm">Looks like you haven't added anything yet.</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => {
                    const product = dishes.find(p => p._id === item.productId);
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

    </section>
  );
}
