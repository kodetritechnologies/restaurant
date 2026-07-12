"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Edit2, UploadCloud, X, Package, Star, Search, Filter } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import BasicProvider from "@/utils/BasicProvider";
import Pagination from "@/components/Pagination";
import { confirmDelete } from "@/utils/swal";
import { useSearchParams, useRouter } from "next/navigation";

interface ProductVariant {
  _id?: string;
  variantName: string;
  sku: string;
  regularPrice: number;
  salePrice?: number;
  quantity: number;
  galleryImages?: string[];
  status: string;
}

interface Product {
  _id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  featuredImage: string;
  galleryImages: string[];
  regularPrice: number;
  salePrice?: number;
  quantity: number | null;
  featured: boolean;
  categories?: string[];
  productType: "simple" | "variable";
  status: "active" | "inactive";
  variants?: ProductVariant[];
}

export default function ProductsPage() {
  const { getMethod, deleteMethod } = BasicProvider();
  const searchParams = useSearchParams();
  const router = useRouter();

  const itemsPerPage = 10;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");

  // Simple search debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let queryUrl = `/api/products?page=${currentPage}&limit=${itemsPerPage}`;
      if (debouncedSearch) queryUrl += `&search=${debouncedSearch}`;
      if (productTypeFilter) queryUrl += `&productType=${productTypeFilter}`;

      const data = await getMethod(queryUrl);
      if (data && data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.products.length);
      }
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch, productTypeFilter]);

  const handleDelete = async (id: string) => {
    const result = await confirmDelete("You won't be able to revert this product deletion!");
    
    if (!result.isConfirmed) return;
    
    try {
      const data = await deleteMethod(`/api/products/${id}`);
      if (data && data.success) {
        toast.success("Product deleted");
        fetchProducts();
      } else {
        toast.error(data?.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-gold" />
            Products Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and organize your products and variants.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="flex items-center gap-2 bg-gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-xl hover:shadow-gold transition-all w-fit"
        >
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      <div className="glass p-6 rounded-2xl border border-foreground/10 min-h-[500px]">
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-surface/50 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-32">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <select 
                            value={productTypeFilter}
                            onChange={(e) => setProductTypeFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface/50 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
                        >
                            <option value="">All Types</option>
                            <option value="simple">Simple</option>
                            <option value="variable">Variable</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-foreground/10 rounded-xl">
                <Package className="w-12 h-12 mb-2 opacity-50" />
                <p>No products found. Create one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-foreground/10 text-muted-foreground text-sm">
                      <th className="py-3 px-4 font-medium">Product</th>
                      <th className="py-3 px-4 font-medium">Type</th>
                      <th className="py-3 px-4 font-medium">Price</th>
                      <th className="py-3 px-4 font-medium">Stock</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const displayImage = product.productType === "variable" && product.variants?.[0]?.galleryImages?.[0] 
                        ? product.variants[0].galleryImages[0] 
                        : product.featuredImage;

                      return (
                      <tr key={product._id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-foreground/10 flex items-center justify-center bg-foreground/5">
                              {displayImage ? (
                                <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground flex items-center gap-2">
                                  {product.name}
                                  {product.featured && <Star size={12} className="text-gold fill-gold" />}
                              </p>
                              {product.shortDescription ? (
                                <div 
                                  className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] prose prose-invert prose-p:m-0 prose-p:inline prose-sm"
                                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                                />
                              ) : (
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">No description</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                            <span className="text-[10px] text-gold/80 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {product.productType}
                            </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                            {product.salePrice ? (
                                <div className="flex flex-col">
                                    <span className="text-foreground font-medium">${product.salePrice.toFixed(2)}</span>
                                    <span className="text-muted-foreground line-through text-xs">${product.regularPrice.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span className="text-foreground">${product.regularPrice.toFixed(2)}</span>
                            )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                            {product.productType === 'simple' ? (product.quantity === null ? "Unlimited" : product.quantity) : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                product.status === 'active' 
                                ? "text-green-400 bg-green-400/10 border border-green-400/20" 
                                : "text-red-400 bg-red-400/10 border border-red-400/20"
                            }`}>
                                {product.status}
                            </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/admin/products/${product._id}`}
                              className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
                              title="Edit Product"
                            >
                              <Edit2 size={16} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(product._id)}
                              className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-all"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center pt-6 pb-6 gap-3">
                <Pagination data={{ currentPage, totalPages }} isAdmin={true} />
                <span className="text-xs text-muted-foreground">
                  Showing {products.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} products
                </span>
              </div>
            )}
        </div>
    </div>
  );
}
