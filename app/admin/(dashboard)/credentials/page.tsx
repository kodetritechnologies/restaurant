"use client";

import { useState, useEffect } from "react";
import { Key, Lock, CreditCard, Banknote, Eye, EyeOff } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";

export default function CredentialsManager() {
  const [razorpayKey, setRazorpayKey] = useState("");
  const [razorpaySecret, setRazorpaySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [razorpayIsActive, setRazorpayIsActive] = useState(false);
  const [codIsActive, setCodIsActive] = useState(true);
  const [payLaterIsActive, setPayLaterIsActive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingRazorpay, setSavingRazorpay] = useState(false);
  const [savingCod, setSavingCod] = useState(false);
  const [savingPayLater, setSavingPayLater] = useState(false);

  const { getMethod, postMethod } = BasicProvider();

  const fetchCredentials = async () => {
    try {
      const data = await getMethod("/api/credentials");
      if (data && data.success) {
        const c = data.credentials;
        if (c.razorpay) {
          setRazorpayKey(c.razorpay.key || "");
          setRazorpaySecret(c.razorpay.secret || "");
          setRazorpayIsActive(!!c.razorpay.isActive);
        }
        if (c.cod) {
          setCodIsActive(!!c.cod.isActive);
        }
        if (c.payLater) {
          setPayLaterIsActive(!!c.payLater.isActive);
        }
      }
    } catch (error) {
      console.error("Error loading credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleSaveRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRazorpay(true);
    try {
      const data = await postMethod("/api/credentials", {
        razorpay: {
          key: razorpayKey,
          secret: razorpaySecret,
          isActive: razorpayIsActive,
        },
      });
      if (data && data.success) {
        toast.success("Razorpay credentials saved successfully.");
      } else {
        toast.error(data.message || "Failed to save Razorpay credentials.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setSavingRazorpay(false);
    }
  };

  const handleSaveCod = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCod(true);
    try {
      const data = await postMethod("/api/credentials", {
        cod: {
          isActive: codIsActive,
        },
      });
      if (data && data.success) {
        toast.success("COD settings saved successfully.");
      } else {
        toast.error(data.message || "Failed to save COD settings.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setSavingCod(false);
    }
  };

  const handleSavePayLater = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayLater(true);
    try {
      const data = await postMethod("/api/credentials", {
        payLater: {
          isActive: payLaterIsActive,
        },
      });
      if (data && data.success) {
        toast.success("Pay Later settings saved successfully.");
      } else {
        toast.error(data.message || "Failed to save Pay Later settings.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setSavingPayLater(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-foreground">
        <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
          Loading credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
          Credentials
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
          Manage payment gateways and methods
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSaveRazorpay} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
          <div className="flex items-center justify-between border-b border-foreground/5 pb-2.5">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold" />
              Razorpay Settings
            </h3>
            <button
              type="button"
              onClick={() => setRazorpayIsActive(!razorpayIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${razorpayIsActive ? "bg-gold" : "bg-foreground/10"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${razorpayIsActive ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Key ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  placeholder="rzp_test_..."
                  className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Key Secret
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showSecret ? "text" : "password"}
                  value={razorpaySecret}
                  onChange={(e) => setRazorpaySecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-background/50 border border-foreground/10 pl-10 pr-10 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-gold transition-colors"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingRazorpay}
            className="w-full rounded-full bg-gradient-gold px-6 py-3 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
          >
            {savingRazorpay ? "Saving..." : "Save Razorpay Settings"}
          </button>
        </form>

        <form onSubmit={handleSaveCod} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
          <div className="flex items-center justify-between border-b border-foreground/5 pb-2.5">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Banknote className="h-5 w-5 text-gold" />
              Cash on Delivery (COD)
            </h3>
            <button
              type="button"
              onClick={() => setCodIsActive(!codIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${codIsActive ? "bg-gold" : "bg-foreground/10"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${codIsActive ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Enable or disable Cash on Delivery option for your customers during checkout.
          </p>

          <button
            type="submit"
            disabled={savingCod}
            className="w-full rounded-full bg-gradient-gold px-6 py-3 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
          >
            {savingCod ? "Saving..." : "Save COD Settings"}
          </button>
        </form>

        <form onSubmit={handleSavePayLater} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
          <div className="flex items-center justify-between border-b border-foreground/5 pb-2.5">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Banknote className="h-5 w-5 text-gold" />
              Pay Later (Dine-in)
            </h3>
            <button
              type="button"
              onClick={() => setPayLaterIsActive(!payLaterIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${payLaterIsActive ? "bg-gold" : "bg-foreground/10"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${payLaterIsActive ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Enable or disable Pay Later option for Dine-in customers to pay after eating.
          </p>

          <button
            type="submit"
            disabled={savingPayLater}
            className="w-full rounded-full bg-gradient-gold px-6 py-3 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
          >
            {savingPayLater ? "Saving..." : "Save Pay Later Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
