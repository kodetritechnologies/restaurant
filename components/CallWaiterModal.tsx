"use client";

import { useEffect, useState } from "react";
import { Droplet, Utensils, Receipt, MessageSquare } from "lucide-react";
import axios from "axios";
import socket from "@/utils/socket";
import toast from "react-hot-toast";

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CallWaiterModal({ isOpen, onClose }: CallWaiterModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const options = [
    { id: "water", label: "Water Bottle", icon: <Droplet className="w-8 h-8" /> },
    { id: "cutlery", label: "Cutlery", icon: <Utensils className="w-8 h-8" /> },
    { id: "bill", label: "Bill", icon: <Receipt className="w-8 h-8" /> },
    { id: "other", label: "Other", icon: <MessageSquare className="w-8 h-8" /> },
  ];

  const handleClose = () => {
    setShowOtherInput(false);
    setOtherText("");
    onClose();
  };

  const handleOptionClick = async (option: string) => {
    if (option === "Other") {
      setShowOtherInput(true);
      return;
    }
    
    try {
      const res = await axios.post("/api/notifications", { message: option });
      const notif = res.data?.notification;
      socket.emit("call_waiter", { 
        _id: notif?._id,
        message: option, 
        timestamp: notif?.createdAt || new Date().toISOString() 
      });
      toast.success("Waiter called successfully!");
      handleClose();
    } catch (err) {
      console.error("Failed to save notification:", err);
      toast.error("Failed to call waiter. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a0b0b] border border-gold/30 rounded-2xl w-full max-w-sm p-6 shadow-[var(--shadow-gold)] relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-foreground/60 hover:text-gold transition-colors text-xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-serif text-gradient-gold mb-6 text-center">Call Waiter</h2>
        {!showOtherInput ? (
          <div className="grid grid-cols-2 gap-4">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt.label)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-900/30 bg-red-950/20 hover:bg-red-900/40 hover:border-red-500/50 transition-all group"
              >
                <span className="mb-3 text-red-400/80 group-hover:text-gold group-hover:scale-110 transition-all">{opt.icon}</span>
                <span className="text-sm font-semibold text-foreground/80 group-hover:text-gold">{opt.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="What do you need?"
              className="w-full bg-red-950/20 border border-red-900/30 rounded-xl p-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-gold/50 resize-none h-28"
            />
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowOtherInput(false)}
                className="flex-1 py-3 rounded-full border border-red-900/50 text-foreground/80 hover:bg-red-900/20 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  if (otherText.trim()) {
                    try {
                      const res = await axios.post("/api/notifications", { message: otherText.trim() });
                      const notif = res.data?.notification;
                      socket.emit("call_waiter", { 
                        _id: notif?._id,
                        message: otherText.trim(), 
                        timestamp: notif?.createdAt || new Date().toISOString() 
                      });
                      toast.success("Waiter called successfully!");
                      handleClose();
                    } catch (err) {
                      console.error("Failed to save notification:", err);
                      toast.error("Failed to call waiter. Please try again.");
                    }
                  }
                }}
                disabled={!otherText.trim()}
                className="flex-1 py-3 rounded-full bg-gradient-gold text-primary-foreground font-bold shadow-[var(--shadow-gold)] hover:brightness-110 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Send Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
