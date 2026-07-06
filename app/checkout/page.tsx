"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ShoppingBag,
  Minus,
  Plus,
  X,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Mail,
  MessageSquare,
  ChevronRight,
  Truck,
  UtensilsCrossed,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Sofa,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface ProductData {
  _id: string;
  name: string;
  featuredImage?: string;
  regularPrice: number;
  salePrice?: number;
  productType: "simple" | "variable";
  variants?: Array<{
    _id: string;
    variantName: string;
    regularPrice: number;
    salePrice?: number;
    galleryImages?: string[];
  }>;
}

type DeliveryType = "delivery" | "pickup" | "dinein";
type PaymentMethod = "cod" | "online";

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30";

const LABEL_CLASS =
  "block text-[10px] font-semibold uppercase tracking-widest text-gold mb-1.5";

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    tableNumber: "",
    note: "",
  });

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cartItems");
      if (stored) setCartItems(JSON.parse(stored));
    } catch {}
  }, []);

  // Fetch products for all items in cart
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, currRes, settingsRes] = await Promise.all([
          fetch("/api/products?status=active"),
          fetch("/api/currency"),
          fetch("/api/settings"),
        ]);
        const [prodData, currData, settingsData] = await Promise.all([
          prodRes.json(),
          currRes.json(),
          settingsRes.json(),
        ]);

        if (prodData?.success) setProducts(prodData.products);
        if (currData?.success && currData.currencies) {
          const def = currData.currencies.find((c: any) => c.isDefault);
          if (def) setCurrencySymbol(def.symbol);
        }
        if (settingsData?.success) setSettings(settingsData.settings);
      } catch {}
      setLoading(false);
    };
    fetchData();

    // Try to pre-fill from customer cookie
    try {
      const Cookies = require("js-cookie");
      const token = Cookies.get("customerToken");
      if (token) {
        fetch("/api/customer/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d?.success && d.customer) {
              setForm((prev) => ({
                ...prev,
                name: d.customer.name || "",
                email: d.customer.email || "",
                phone: d.customer.phone || "",
              }));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const getItemDetails = useCallback(
    (item: CartItem) => {
      const product = products.find((p) => p._id === item.productId);
      if (!product) return null;

      let title = product.name;
      let price = product.salePrice || product.regularPrice;
      let image = product.featuredImage || "";
      let variantName = "";

      if (product.productType === "variable" && item.variantId) {
        const variant = product.variants?.find((v) => v._id === item.variantId);
        if (variant) {
          variantName = variant.variantName;
          price = variant.salePrice || variant.regularPrice;
          image = variant.galleryImages?.[0] || image;
        }
      }

      return { title, price, image, variantName };
    },
    [products]
  );

  const updateQty = (productId: string, variantId: string | undefined, delta: number) => {
    setCartItems((prev) => {
      const updated = prev
        .map((i) =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0);
      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string, variantId: string | undefined) => {
    setCartItems((prev) => {
      const updated = prev.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      );
      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const details = getItemDetails(item);
    return acc + (details?.price || 0) * item.quantity;
  }, 0);

  const deliveryFee = deliveryType === "delivery" ? 3.99 : 0;
  const total = subtotal + deliveryFee;

  const deliveryLabel =
    deliveryType === "delivery"
      ? "Delivery Fee"
      : deliveryType === "pickup"
      ? "Pick Up"
      : "Dine In";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (deliveryType === "dinein" && !form.tableNumber) {
      toast.error("Please enter your table number.");
      return;
    }
    if (deliveryType === "delivery" && !form.address) {
      toast.error("Please enter your delivery address.");
      return;
    }

    setPlacing(true);
    try {
      // Simulate order placement (replace with real API call)
      await new Promise((res) => setTimeout(res, 1800));
      // Clear cart
      localStorage.removeItem("cartItems");
      setCartItems([]);
      setSuccess(true);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-5 pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl scale-150" />
              <div className="relative w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
              Order Placed!
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              Thank you for your order. We're preparing it now.
            </p>
            <p className="text-sm text-muted-foreground mb-10">
              You'll receive a confirmation{" "}
              {form.email ? `at ${form.email}` : "shortly"}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/menu")}
                className="px-8 py-3 rounded-full bg-gold text-primary-foreground font-semibold text-sm hover:bg-gold/90 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-8 py-3 rounded-full border border-white/10 hover:border-gold/40 text-muted-foreground hover:text-gold font-semibold text-sm transition-colors"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </main>
        <Footer settings={settings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24">
        <section className="px-5 md:px-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-10"
          >
            <button
              onClick={() => router.push("/menu")}
              className="p-2.5 rounded-full border border-white/10 hover:border-gold/40 text-muted-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gradient-gold leading-none">
                Checkout
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
                Complete your order
              </p>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-gold" />
              <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
                Loading...
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 glass rounded-3xl"
            >
              <ShoppingBag className="w-16 h-16 text-gold/30 mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Add some items from the menu first.
              </p>
              <button
                onClick={() => router.push("/menu")}
                className="px-8 py-3 rounded-full bg-gold text-primary-foreground font-semibold text-sm hover:bg-gold/90 transition-colors"
              >
                Browse Menu
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                {/* ── Left column: Details ── */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Delivery / Pickup toggle */}
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gold" />
                      Delivery Method
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        {
                          type: "delivery" as DeliveryType,
                          label: "Home Delivery",
                          icon: <Truck className="w-5 h-5" />,
                          sub: `+${currencySymbol}3.99 fee`,
                          subClass: "text-muted-foreground",
                        },
                        {
                          type: "pickup" as DeliveryType,
                          label: "Pick Up",
                          icon: <UtensilsCrossed className="w-5 h-5" />,
                          sub: "Free",
                          subClass: "text-green-400",
                        },
                        {
                          type: "dinein" as DeliveryType,
                          label: "Dine In",
                          icon: <Sofa className="w-5 h-5" />,
                          sub: "Free",
                          subClass: "text-green-400",
                        },
                      ]).map(({ type, label, icon, sub, subClass }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDeliveryType(type)}
                          className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-sm font-semibold transition-all ${
                            deliveryType === type
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                          }`}
                        >
                          {icon}
                          <span className="text-center leading-tight">{label}</span>
                          <span className={`text-[10px] font-normal ${subClass}`}>
                            {sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                      <User className="w-5 h-5 text-gold" />
                      Your Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="John Doe"
                            required
                            value={form.name}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            className={INPUT_CLASS + " pl-11"}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={form.email}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, email: e.target.value }))
                            }
                            className={INPUT_CLASS + " pl-11"}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="tel"
                            placeholder="+1 555 000 0000"
                            required
                            value={form.phone}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, phone: e.target.value }))
                            }
                            className={INPUT_CLASS + " pl-11"}
                          />
                        </div>
                      </div>
                      {deliveryType === "delivery" && (
                        <div>
                          <label className={LABEL_CLASS}>City</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="New York"
                              value={form.city}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, city: e.target.value }))
                              }
                              className={INPUT_CLASS + " pl-11"}
                            />
                          </div>
                        </div>
                      )}
                      {/* Table number for dine-in */}
                      <AnimatePresence>
                        {deliveryType === "dinein" && (
                          <motion.div
                            key="table"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <label className={LABEL_CLASS}>Table Number</label>
                            <div className="relative">
                              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="text"
                                placeholder="e.g. 7"
                                required={deliveryType === "dinein"}
                                value={form.tableNumber}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    tableNumber: e.target.value,
                                  }))
                                }
                                className={INPUT_CLASS + " pl-11"}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {deliveryType === "delivery" && (
                        <motion.div
                          key="address"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <label className={LABEL_CLASS}>Delivery Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                            <textarea
                              rows={2}
                              placeholder="123 Main Street, Apartment 4B"
                              required={deliveryType === "delivery"}
                              value={form.address}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  address: e.target.value,
                                }))
                              }
                              className={
                                INPUT_CLASS +
                                " pl-11 resize-none leading-relaxed"
                              }
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className={LABEL_CLASS}>
                        Special Instructions (optional)
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                        <textarea
                          rows={2}
                          placeholder="Allergies, preferences, extra sauce..."
                          value={form.note}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, note: e.target.value }))
                          }
                          className={
                            INPUT_CLASS + " pl-11 resize-none leading-relaxed"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-gold" />
                      Payment Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["cod", "online"] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`flex items-center gap-3 py-4 px-5 rounded-xl border text-sm font-semibold transition-all ${
                            paymentMethod === method
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              paymentMethod === method
                                ? "border-gold"
                                : "border-white/30"
                            }`}
                          >
                            {paymentMethod === method && (
                              <span className="w-2 h-2 rounded-full bg-gold" />
                            )}
                          </span>
                          {method === "cod"
                            ? "Cash on Delivery"
                            : "Pay Online"}
                        </button>
                      ))}
                    </div>
                    {paymentMethod === "online" && (
                      <p className="text-xs text-muted-foreground bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                        🔒 You'll be redirected to our secure payment gateway
                        after confirming your order.
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* ── Right column: Order Summary ── */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="lg:sticky lg:top-32 space-y-4"
                >
                  <div className="glass rounded-2xl p-6 space-y-5">
                    <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-gold" />
                      Order Summary
                    </h2>

                    {/* Items */}
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {cartItems.map((item, idx) => {
                        const details = getItemDetails(item);
                        if (!details) return null;
                        return (
                          <div
                            key={`${item.productId}-${item.variantId || idx}`}
                            className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group"
                          >
                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black/20 border border-white/5">
                              {details.image ? (
                                <img
                                  src={details.image}
                                  alt={details.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src="/assets/no-image-food.png"
                                  alt="No image"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm line-clamp-1">
                                {details.title}
                              </p>
                              {details.variantName && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {details.variantName}
                                </p>
                              )}
                              <p className="text-gold text-sm font-bold mt-1">
                                {currencySymbol}
                                {(details.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.productId, item.variantId)
                                }
                                className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-lg p-0.5 h-7">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQty(
                                      item.productId,
                                      item.variantId,
                                      -1
                                    )
                                  }
                                  className="w-6 h-full rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-medium text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQty(
                                      item.productId,
                                      item.variantId,
                                      1
                                    )
                                  }
                                  className="w-6 h-full rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/5 pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span>
                          {currencySymbol}
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{deliveryLabel}</span>
                        <span
                          className={
                            deliveryType !== "delivery" ? "text-green-400" : ""
                          }
                        >
                          {deliveryType === "delivery"
                            ? `${currencySymbol}${deliveryFee.toFixed(2)}`
                            : "Free"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-gold">
                          {currencySymbol}
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={placing}
                    className="w-full h-14 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-base hover:opacity-90 transition-all shadow-[var(--shadow-gold)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold/60" />
                    Your information is secure and encrypted
                  </p>

                  {/* Back to menu */}
                  <button
                    type="button"
                    onClick={() => router.push("/menu")}
                    className="w-full py-3 rounded-xl border border-white/10 hover:border-gold/30 text-muted-foreground hover:text-gold text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </button>
                </motion.div>
              </div>
            </form>
          )}
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
