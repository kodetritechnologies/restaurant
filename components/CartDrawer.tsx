"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, X, ShoppingCart } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    items: cartItems, 
    subtotalAmount, 
    cartTotalItems, 
    isCartOpen, 
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    currencySymbol
  } = useCart();

  return (
    <>
      {cartTotalItems > 0 && pathname !== "/checkout" && (
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

      <AnimatePresence>
        {isCartOpen && (
          <>
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
                    const pId = (typeof item.productId === 'object' ? item.productId?._id : item.productId) as string;
                    const vId = (typeof item.variantId === 'object' ? item.variantId?._id : item.variantId) as string | null;
                    
                    const productObj = typeof item.productId === 'object' ? item.productId : null;
                    const variantObj = typeof item.variantId === 'object' ? item.variantId : null;

                    let title = productObj?.name || "Unknown Product";
                    let price = item.price;
                    let image = productObj?.featuredImage || "";
                    let variantName = "";
                    let maxStock = productObj?.quantity ?? null;

                    if (item.variantId) {
                      if (variantObj) {
                        variantName = variantObj.variantName;
                        if (variantObj.galleryImages?.[0]) image = variantObj.galleryImages[0];
                        maxStock = variantObj.quantity ?? maxStock;
                      }
                    }

                    return (
                      <div key={`${pId}-${vId || idx}`} className="flex gap-4 p-4 rounded-2xl bg-foreground/5 border border-foreground/5 relative group">
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
                              onClick={() => updateQuantity(pId, vId, -1, maxStock)}
                              className="w-6 h-full rounded hover:bg-foreground/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(pId, vId, 1, maxStock)}
                              className="w-6 h-full rounded hover:bg-foreground/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(pId, vId)}
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
                    <span className="text-2xl font-bold text-gold">{currencySymbol}{subtotalAmount.toFixed(2)}</span>
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
    </>
  );
}
