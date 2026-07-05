"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import BasicProvider from "@/utils/BasicProvider";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const { id } = useParams();
  const { getMethod } = BasicProvider();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getMethod(`/api/products/${id}`);
        if (data && data.success && data.product) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return <ProductForm initialData={product} />;
}
