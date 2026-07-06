"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Mail, ArrowRight, ShieldCheck, KeyRound, X } from "lucide-react";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { postMethod } = BasicProvider();
  
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("email");
      setEmail("");
      setOtp("");
      setError("");
    }
  }, [isOpen]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await postMethod("/api/customer/auth/send-otp", { email });

      if (!data || !data.success) {
        setError(data?.message || "Failed to send OTP.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast.success("OTP sent to your email.");
      // In dev mode, we might see the devOtp
      if (data.devOtp) {
        toast("Dev OTP: " + data.devOtp, { icon: "🛠️" });
      }
      setStep("otp");
    } catch (err: any) {
      setError("Network or server connection issue. Please try again.");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await postMethod("/api/customer/auth/verify-otp", { email, otp });

      if (!data || !data.success) {
        setError(data?.message || "Failed to verify OTP.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      toast.success("Welcome back!");
      onClose();
      // Optionally reload the page or update a global user state here
      window.location.reload(); 
    } catch (err: any) {
      setError("Network or server connection issue. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              {/* Glow border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 via-gold to-gold/30 rounded-3xl opacity-30 blur-sm" />

              <div className="relative glass rounded-3xl p-6 sm:p-8 shadow-elegant overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Decorative Elements */}
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gold/10 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

                {/* Logo & Header */}
                <div className="relative flex flex-col items-center text-center mb-6">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.05 }}
                    className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold shadow-gold mb-3"
                  >
                    <UtensilsCrossed className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                  </motion.div>
                  <h2 className="text-xl font-medium text-foreground">
                    {step === "email" ? "Sign In / Sign Up" : "Enter Verification Code"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step === "email"
                      ? "Enter your email to receive a secure login link."
                      : `We've sent a 6-digit code to ${email}`
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp} className="relative space-y-4">
                  <AnimatePresence mode="wait">
                    {step === "email" ? (
                      <motion.div
                        key="email-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gold">
                          Email Address
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                            <Mail className="h-4 w-4" />
                          </span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full rounded-full border border-white/10 bg-background/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="otp-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gold">
                          6-Digit Code
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                            <KeyRound className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="••••••"
                            required
                            className="w-full rounded-full border border-white/10 bg-background/60 pl-11 pr-4 py-3 text-sm tracking-[0.5em] text-center text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30 font-mono"
                          />
                        </div>
                        <div className="flex justify-between items-center px-1 pt-2">
                          <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="text-[10px] text-muted-foreground hover:text-gold transition-colors"
                          >
                            Change Email
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isLoading}
                            className="text-[10px] text-gold font-semibold hover:underline"
                          >
                            Resend Code
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Validation Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 rounded-xl bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-ping shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full overflow-hidden group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.02] disabled:opacity-75 disabled:pointer-events-none mt-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{step === "email" ? "Sending Code..." : "Verifying..."}</span>
                      </div>
                    ) : (
                      <>
                        <span>{step === "email" ? "Continue with Email" : "Sign In"}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Credential Note at the bottom */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60">
                  <ShieldCheck className="h-3 w-3 text-gold/60" />
                  <span>Secure Passwordless Login</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
