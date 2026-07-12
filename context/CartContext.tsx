"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useCustomer } from "./CustomerContext";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";

export interface CartItem {
  productId: any;
  variantId?: any;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  subtotalAmount: number;
  totalAmount: number;
  cartTotalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: any, variant: any | null, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, variantId: string | null | undefined, delta: number, maxStock: number | null) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string | null) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  currencySymbol: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading: customerLoading } = useCustomer();
  const { getMethod, postMethod } = BasicProvider();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const subtotalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAmount = subtotalAmount;
  const cartTotalItems = items.length;
  useEffect(() => {
    if (customerLoading) return;

    const initializeCart = async () => {
      setIsLoading(true);
      if (isLoggedIn) {
        try {
          const response = await getMethod("/api/customer/cart");
          let backendItems: CartItem[] = response?.cart?.items || [];
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            try {
              const parsedLocalCart: CartItem[] = JSON.parse(localCart);
              if (parsedLocalCart.length > 0) {
                // Merge logic: combine backendItems and parsedLocalCart
                const mergedItems = [...backendItems];
                parsedLocalCart.forEach((localItem: any) => {
                  const localProductId = typeof localItem.productId === 'object' ? localItem.productId?._id : localItem.productId;
                  const localVariantId = typeof localItem.variantId === 'object' ? localItem.variantId?._id : localItem.variantId;
                  
                  const existingIndex = mergedItems.findIndex((bItem: any) => {
                    const bProductId = typeof bItem.productId === 'object' ? bItem.productId?._id : bItem.productId;
                    const bVariantId = typeof bItem.variantId === 'object' ? bItem.variantId?._id : bItem.variantId;
                    return bProductId === localProductId && bVariantId === localVariantId;
                  });

                  if (existingIndex >= 0) {
                    mergedItems[existingIndex].quantity += localItem.quantity;
                  } else {
                    mergedItems.push(localItem);
                  }
                });

                const payloadItems = mergedItems.map((item: any) => ({
                  ...item,
                  productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
                  variantId: (typeof item.variantId === 'object' ? item.variantId?._id : item.variantId) || null,
                }));
                
                const postRes = await postMethod("/api/customer/cart", { items: payloadItems });
                
                if (postRes && postRes.success !== false) {
                  localStorage.removeItem("cart");
                  const updatedResponse = await getMethod("/api/customer/cart");
                  if (updatedResponse?.cart?.items) {
                    backendItems = updatedResponse.cart.items;
                  }
                }
              }
            } catch (e) {
              console.error("Failed to parse local cart during merge", e);
            }
          }
          setItems(backendItems);
        } catch (error) {
          console.error("Failed to fetch cart", error);
        }
      } else {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          try {
            setItems(JSON.parse(localCart));
          } catch (e) {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }

      // Fetch currency once
      try {
        const currData = await getMethod("/api/currency?default=true");
        if (currData?.success && currData.currency) {
          setCurrencySymbol(currData.currency.symbol);
        }
      } catch (err) {
        console.error("Failed to fetch currency", err);
      }

      setIsLoading(false);
    };

    initializeCart();
  }, [isLoggedIn, customerLoading]);

  const saveCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    if (isLoggedIn) {
      try {
        const payloadItems = newItems.map(item => ({
          ...item,
          productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
          variantId: (typeof item.variantId === 'object' ? item.variantId?._id : item.variantId) || null,
        }));
        await postMethod("/api/customer/cart", { items: payloadItems });
      } catch (error) {
        console.error("Failed to save cart to backend", error);
        toast.error("Failed to sync cart");
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(newItems));
    }
  };

  const addToCart = async (product: any, variant: any | null, quantity: number) => {
    let price = variant ? (variant.salePrice || variant.regularPrice) : (product.salePrice || product.regularPrice);
    let maxStock = variant ? variant.quantity : product.quantity;

    const existingItemIndex = items.findIndex(
      (i) => {
        const id1 = typeof i.productId === 'object' ? i.productId?._id : i.productId;
        const v1 = typeof i.variantId === 'object' ? i.variantId?._id : i.variantId;
        return String(id1) === String(product._id) && (variant ? String(v1) === String(variant._id) : (!v1));
      }
    );

    const currentQty = existingItemIndex >= 0 ? items[existingItemIndex].quantity : 0;
    if (maxStock !== null && currentQty + quantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    let newItems = [...items];
    if (existingItemIndex >= 0) {
      newItems[existingItemIndex].quantity += quantity;
    } else {
      newItems.push({
        productId: product,
        variantId: variant || null,
        price: price || 0,
        quantity
      });
    }
    await saveCart(newItems);
    toast.success("Added to cart");
  };

  const updateQuantity = async (productId: string, variantId: string | null | undefined, delta: number, maxStock: number | null) => {
    const existingItemIndex = items.findIndex(i => {
      const id1 = typeof i.productId === 'object' ? i.productId?._id : i.productId;
      const v1 = typeof i.variantId === 'object' ? i.variantId?._id : i.variantId;
      return String(id1) === String(productId) && (variantId ? String(v1) === String(variantId) : (!v1));
    });

    if (existingItemIndex < 0) return;

    const newQty = items[existingItemIndex].quantity + delta;
    if (newQty <= 0) {
      await removeFromCart(productId, variantId);
    } else {
      if (maxStock !== null && newQty > maxStock) {
        toast.error(`Only ${maxStock} items available in stock`);
        return;
      }
      const newItems = [...items];
      newItems[existingItemIndex].quantity = newQty;
      await saveCart(newItems);
    }
  };

  const removeFromCart = async (productId: string, variantId?: string | null) => {
    const newItems = items.filter(
      (i) => {
        const id1 = typeof i.productId === 'object' ? i.productId?._id : i.productId;
        const v1 = typeof i.variantId === 'object' ? i.variantId?._id : i.variantId;
        return !(String(id1) === String(productId) && (variantId ? String(v1) === String(variantId) : (!v1)));
      }
    );
    await saveCart(newItems);
    toast.success("Removed from cart");
  };

  const clearCart = async () => {
    await saveCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotalAmount,
        totalAmount,
        cartTotalItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoading,
        currencySymbol
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
