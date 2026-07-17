"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right" 
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--surface)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-elegant)",
          borderRadius: "1rem",
          padding: "16px 20px",
          fontSize: "0.95rem",
          fontWeight: 500,
        },
        success: {
          iconTheme: {
            primary: "var(--gold)",
            secondary: "var(--surface)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--destructive)",
            secondary: "var(--surface)",
          },
        },
      }}
    />
  );
}
