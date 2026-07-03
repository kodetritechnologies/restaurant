"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";

export default function AdminLogin() {
  const router = useRouter();
  const { postMethod } = BasicProvider();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isLogin && !name) {
      setError("Please provide your name.");
      return;
    }
    if (!isLogin && !agreeTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      const data = await postMethod(endpoint, payload);

      if (!data || !data.success) {
        toast.error(data?.message || "Authentication failed.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      if (isLogin) {
        toast.success("Welcome back!");
        router.push("/admin");
      } else {
        toast.success("Registration successful! Please login with your new account.");
        setIsLogin(true);
        setName("");
        setPassword("");
        setAgreeTerms(false);
      }
    } catch (err: any) {
      toast.error("Network or server connection issue. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background px-4 py-16 overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px]" />

      {/* Premium Login Box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-lg"
      >
        {/* Glow border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 via-gold to-gold/30 rounded-3xl opacity-30 blur-sm" />

        <div className="relative glass rounded-3xl p-8 sm:p-10 shadow-elegant">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              className="grid h-12 w-12 place-items-center rounded-full bg-gradient-gold shadow-gold mb-3"
            >
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
            </motion.div>
            <h1 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none tracking-tight">
              Auréa
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mt-1 mb-3">
              Fine Dining Workspace
            </p>
            <h2 className="text-xl font-medium text-foreground">
              {isLogin ? "Welcome Back" : "Create Admin Account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin
                ? "Enter your credentials to access the admin portal"
                : "Sign up to register as restaurant administrator"
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {/* Name Field (Sign Up Only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Master Chef"
                      required={!isLogin}
                      className="w-full rounded-full border border-white/10 bg-background/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
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
                  placeholder="admin@aurea.dining"
                  required
                  className="w-full rounded-full border border-white/10 bg-background/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-xs text-muted-foreground hover:text-gold transition-colors">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-full border border-white/10 bg-background/60 pl-11 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms / Remember */}
            <div className="flex items-center justify-between py-1">
              {!isLogin ? (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="accent-gold h-4 w-4 rounded border-white/20 bg-background text-primary-foreground focus:ring-gold"
                  />
                  <span className="text-xs text-muted-foreground">
                    I agree to the <a href="#" className="text-gold hover:underline">Terms of Service</a>
                  </span>
                </label>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-gold h-4 w-4 rounded border-white/20 bg-background text-primary-foreground focus:ring-gold"
                  />
                  <span className="text-xs text-muted-foreground">Remember this session</span>
                </label>
              )}
            </div>

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
              className="relative w-full overflow-hidden group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.02] disabled:opacity-75 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying workspace...</span>
                </div>
              ) : (
                <>
                  <span>{isLogin ? "Sign In to Console" : "Register Credentials"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Tab Switcher */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground">
              {isLogin ? "Not registered as admin yet?" : "Already have an admin account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="ml-1 text-gold font-semibold hover:underline hover:text-gold-bright transition-colors"
              >
                {isLogin ? "Register here" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Credential Note at the bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground/60 text-center flex items-center gap-1.5 whitespace-nowrap">
        <ShieldCheck className="h-3 w-3 text-gold/60" />
        <span>Bootstrapping: First user to register becomes the Administrator</span>
      </div>
    </div>
  );
}
