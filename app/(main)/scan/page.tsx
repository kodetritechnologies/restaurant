"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const tableNumber = searchParams.get("table");
    
    if (tableNumber) {
      Cookies.set("scannedTableNumber", tableNumber, { expires: 1 });
    }
    
    const timer = setTimeout(() => {
      router.push("/menu");
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const tableNumber = searchParams.get("table");

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-5">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-3xl flex flex-col items-center justify-center max-w-md w-full text-center shadow-elegant space-y-6"
      >
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
          className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold"
        >
          <UtensilsCrossed className="w-10 h-10" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-gradient-gold">
            {tableNumber ? `Welcome to Table ${tableNumber}!` : "Welcome!"}
          </h1>
          <p className="text-muted-foreground text-sm">
            We are preparing your menu. You will be redirected shortly...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ScanContent />
    </Suspense>
  );
}
