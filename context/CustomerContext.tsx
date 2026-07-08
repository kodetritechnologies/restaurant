"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
}

interface CustomerContextType {
  customer: Customer | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refreshCustomer: () => Promise<void>;
  logout: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { getMethod } = BasicProvider();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomer = async () => {
    const token = Cookies.get("customerToken");
    if (!token) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await getMethod("/api/customer/me");
      if (data?.success && data.customer) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("customerToken", { path: "/" });
    setCustomer(null);
    toast.success("Successfully logged out");
  };

  useEffect(() => {
    refreshCustomer();
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoading,
        isLoggedIn: !!customer,
        refreshCustomer,
        logout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
