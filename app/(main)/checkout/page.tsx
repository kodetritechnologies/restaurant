"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BasicProvider from "@/utils/BasicProvider";
import { useCart } from "@/context/CartContext";
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



type DeliveryType = "delivery" | "pickup" | "dinein";
type PaymentMethod = "cod" | "razorpay" | "payLater";

const INPUT_CLASS =
  "w-full rounded-xl border border-foreground/10 bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30";

const LABEL_CLASS =
  "block text-[10px] font-semibold uppercase tracking-widest text-gold mb-1.5";

export default function CheckoutPage() {
  const { getMethod, postMethod } = BasicProvider();
  const router = useRouter();

  const {
    items: cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotalAmount: subtotal,
  } = useCart();

  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [deliveryType, setDeliveryType] = useState<DeliveryType | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>(["cod", "razorpay"]);
  const [paymentConfig, setPaymentConfig] = useState({ cod: false, razorpay: false, payLater: false });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    tableNumber: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const methods: PaymentMethod[] = [];
    if (deliveryType === "dinein") {
      if (paymentConfig.razorpay) methods.push("razorpay");
      if (paymentConfig.payLater) methods.push("payLater");
    } else {
      if (paymentConfig.cod) methods.push("cod");
      if (paymentConfig.razorpay) methods.push("razorpay");
    }
    setAvailablePaymentMethods(methods);
    
    setPaymentMethod((prev) => {
      if (methods.length > 0 && !methods.includes(prev)) {
        return methods[0];
      }
      return prev;
    });
  }, [deliveryType, paymentConfig]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [currData, settingsData, paymentData] = await Promise.all([
          getMethod("/api/currency?default=true"),
          getMethod("/api/settings?field=deliveryFee"),
          getMethod("/api/payment-methods"),
        ]);

        if (currData?.success && currData.currency) {
          setCurrencySymbol(currData.currency.symbol);
        }
        if (settingsData?.success) {
          setSettings(settingsData.settings);
        }
        if (paymentData?.success && paymentData.paymentMethods) {
          setPaymentConfig(paymentData.paymentMethods);
        }
      } catch { }
      setLoading(false);
    };
    fetchData();

    try {
      const Cookies = require("js-cookie");
      const token = Cookies.get("customerToken");
      if (token) {
        getMethod("/api/customer/me")
          .then((d) => {
            if (d?.success && d.customer) {
              setForm((prev) => ({
                ...prev,
                name: d.customer.name || "",
                email: d.customer.email || "",
                phone: d.customer.phone || "",
                address: d.customer.address || "",
                city: d.customer.city || "",
              }));
            }
          })
          .catch(() => { });
      }
    } catch { }
  }, []);

  const getItemDetails = useCallback((item: any) => {
    const productObj = typeof item.productId === 'object' ? item.productId : null;
    const variantObj = typeof item.variantId === 'object' ? item.variantId : null;

    if (!productObj) return null;

    let title = productObj.name || "Unknown Product";
    let price = item.price;
    let image = productObj.featuredImage || "";
    let variantName = "";

    if (variantObj) {
      variantName = variantObj.variantName;
      if (variantObj.galleryImages?.[0]) {
        image = variantObj.galleryImages[0];
      }
    }

    return { title, price, image, variantName };
  }, []);

  const deliveryFee = (deliveryType === "delivery" && settings?.isDeliveryFeeActive) ? (settings?.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;

  const deliveryLabel =
    deliveryType === "delivery"
      ? "Delivery Fee"
      : deliveryType === "pickup"
        ? "Pick Up"
        : "Dine In";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: Record<string, string> = {};

    if (String(form.name || "").trim().length < 3) {
      newErrors.name = "Minimum 3 characters required";
    }
    
    if (!/^\d{10}$/.test(String(form.phone || "").trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(form.email || "").trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (deliveryType === "delivery") {
      if (!String(form.city || "").trim()) {
        newErrors.city = "City is required for delivery";
      }
      if (!String(form.address || "").trim()) {
        newErrors.address = "Delivery address is required";
      }
    }

    if (!deliveryType) {
      toast.error("Please select a Delivery Method");
      newErrors.deliveryType = "Please select a delivery method";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (deliveryType === "dinein" && !form.tableNumber) {
      toast.error("Please enter your table number.");
      return;
    }

    setPlacing(true);
    try {
      const orderItems = cartItems.map((item: any) => {
        const details = getItemDetails(item);
        const pId = typeof item.productId === 'object' ? item.productId?._id : item.productId;
        const vId = typeof item.variantId === 'object' ? item.variantId?._id : item.variantId;

        return {
          productId: pId,
          variantId: vId || null,
          quantity: item.quantity,
          price: details?.price || 0,
          name: details?.title || "Unknown Item",
          variantName: details?.variantName || "",
          image: details?.image || "",
        };
      });

      const payload = {
        cartItems: orderItems,
        customerDetails: form,
        deliveryType,
        paymentMethod,
        subtotal,
        deliveryFee,
        totalAmount: total,
      };

      const data = await postMethod("/api/customer/orders", payload);

      if (!data || !data.success) {
        toast.error(data.message || "Failed to place order.");
        setPlacing(false);
        return;
      }

      // Clear cart
      await clearCart();
      
      if (paymentMethod === "cod") {
        router.push(`/order/success?orderId=${data.order._id}`);
      } else {
        router.push(`/order/pending?orderId=${data.order._id}`);
      }
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>

      <main className="flex-1 pt-32 pb-24">
        <section className="px-5 md:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-10"
          >
            <button
              onClick={() => router.push("/menu")}
              className="p-2.5 rounded-full border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold transition-colors"
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gold" />
                      Delivery Method
                    </h2>
                    <div className={`grid grid-cols-1 ${
                      (settings?.isDeliveryFeeActive ? 1 : 0) + 1 + (paymentConfig.payLater ? 1 : 0) === 3
                        ? "sm:grid-cols-3"
                        : (settings?.isDeliveryFeeActive ? 1 : 0) + 1 + (paymentConfig.payLater ? 1 : 0) === 2
                        ? "sm:grid-cols-2"
                        : "sm:grid-cols-1"
                    } gap-3`}>
                      {([
                        ...(settings?.isDeliveryFeeActive
                          ? [
                            {
                              type: "delivery" as DeliveryType,
                              label: "Home Delivery",
                              icon: <Truck className="w-5 h-5" />,
                              sub: `+${currencySymbol}${settings?.deliveryFee || 0} fee`,
                              subClass: "text-muted-foreground",
                            },
                          ]
                          : []),
                        {
                          type: "pickup" as DeliveryType,
                          label: "Pick Up",
                          icon: <UtensilsCrossed className="w-5 h-5" />,
                          sub: "Free",
                          subClass: "text-green-400",
                        },
                        ...(paymentConfig.payLater ? [{
                          type: "dinein" as DeliveryType,
                          label: "Dine In",
                          icon: <Sofa className="w-5 h-5" />,
                          sub: "Free",
                          subClass: "text-green-400",
                        }] : []),
                      ]).map(({ type, label, icon, sub, subClass }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setDeliveryType(type);
                            if (errors.deliveryType) setErrors({ ...errors, deliveryType: "" });
                          }}
                          className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-sm font-semibold transition-all ${deliveryType === type
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-foreground/10 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                            } ${errors.deliveryType ? "border-red-500/50" : ""}`}
                        >
                          {icon}
                          <span className="text-center leading-tight">{label}</span>
                          <span className={`text-[10px] font-normal ${subClass}`}>
                            {sub}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.deliveryType && <span className="text-[10px] text-red-400 mt-1 block">{errors.deliveryType}</span>}
                  </div>

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
                            value={form.name}
                            onChange={(e) => {
                              setForm((f) => ({ ...f, name: e.target.value }));
                              if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            className={`${INPUT_CLASS} pl-11 ${errors.name ? "border-red-500/50 focus:border-red-500" : ""}`}
                          />
                        </div>
                        {errors.name && <span className="text-[10px] text-red-400 mt-1 block">{errors.name}</span>}
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => {
                              setForm((f) => ({ ...f, email: e.target.value }));
                              if (errors.email) setErrors({ ...errors, email: "" });
                            }}
                            className={`${INPUT_CLASS} pl-11 ${errors.email ? "border-red-500/50 focus:border-red-500" : ""}`}
                          />
                        </div>
                        {errors.email && <span className="text-[10px] text-red-400 mt-1 block">{errors.email}</span>}
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="tel"
                            placeholder="5550000000"
                            value={form.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setForm((f) => ({ ...f, phone: val }));
                              if (errors.phone) setErrors({ ...errors, phone: "" });
                            }}
                            className={`${INPUT_CLASS} pl-11 ${errors.phone ? "border-red-500/50 focus:border-red-500" : ""}`}
                          />
                        </div>
                        {errors.phone && <span className="text-[10px] text-red-400 mt-1 block">{errors.phone}</span>}
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
                              onChange={(e) => {
                                setForm((f) => ({ ...f, city: e.target.value }));
                                if (errors.city) setErrors({ ...errors, city: "" });
                              }}
                              className={`${INPUT_CLASS} pl-11 ${errors.city ? "border-red-500/50 focus:border-red-500" : ""}`}
                            />
                          </div>
                          {errors.city && <span className="text-[10px] text-red-400 mt-1 block">{errors.city}</span>}
                        </div>
                      )}
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
                              value={form.address}
                              onChange={(e) => {
                                setForm((f) => ({ ...f, address: e.target.value }));
                                if (errors.address) setErrors({ ...errors, address: "" });
                              }}
                              className={`${INPUT_CLASS} pl-11 resize-none leading-relaxed ${errors.address ? "border-red-500/50 focus:border-red-500" : ""}`}
                            />
                          </div>
                          {errors.address && <span className="text-[10px] text-red-400 mt-1 block">{errors.address}</span>}
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

                  <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-gold" />
                      Payment Method
                    </h2>
                    {availablePaymentMethods.length === 0 ? (
                      <p className="text-sm text-red-400">No payment methods available right now.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {availablePaymentMethods.map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`flex items-center gap-3 py-4 px-5 rounded-xl border text-sm font-semibold transition-all ${
                              paymentMethod === method
                                ? "border-gold bg-gold/10 text-gold"
                                : "border-foreground/10 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                            }`}
                          >
                            <ShieldCheck className={`h-5 w-5 ${paymentMethod === method ? "text-gold" : "text-muted-foreground"}`} />
                            {method === "cod" ? "Cash on Delivery" : method === "payLater" ? "Pay Later" : "Razorpay"}
                          </button>
                        ))}
                      </div>
                    )}
                    {paymentMethod === "razorpay" && (
                      <p className="text-xs text-muted-foreground bg-foreground/5 rounded-xl px-4 py-3 border border-foreground/5">
                        🔒 You'll be redirected to our secure payment gateway
                        after confirming your order.
                      </p>
                    )}
                  </div>
                </motion.div>

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

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {cartItems.map((item: any, idx) => {
                        const details = getItemDetails(item);
                        if (!details) return null;

                        const pId = typeof item.productId === 'object' ? item.productId?._id : item.productId;
                        const vId = typeof item.variantId === 'object' ? item.variantId?._id : item.variantId;
                        const maxStock = (item.variantId?.quantity) ?? (item.productId?.quantity) ?? null;

                        return (
                          <div
                            key={`${pId}-${vId || idx}`}
                            className="flex gap-3 p-3 rounded-xl bg-foreground/5 border border-foreground/5 group"
                          >
                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black/20 border border-foreground/5">
                              {details.image ? (
                                <img
                                  src={details.image}
                                  alt={details.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src="/assets/no-image-food.jpg"
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
                                  removeFromCart(pId, vId)
                                }
                                className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center gap-1 bg-black/30 border border-foreground/10 rounded-lg p-0.5 h-7">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(pId, vId, -1, maxStock)
                                  }
                                  className="w-6 h-full rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-foreground/10 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-medium text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(pId, vId, 1, maxStock)
                                  }
                                  className="w-6 h-full rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-foreground/10 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-foreground/5 pt-4 space-y-2">
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
                      <div className="flex justify-between items-center pt-3 border-t border-foreground/5">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-gold">
                          {currencySymbol}
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

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

                  <button
                    type="button"
                    onClick={() => router.push("/menu")}
                    className="w-full py-3 rounded-xl border border-foreground/10 hover:border-gold/30 text-muted-foreground hover:text-gold text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
    </>
  );
}
