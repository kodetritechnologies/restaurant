"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Edit2, UploadCloud, X, Package, Star, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import BasicProvider from "@/utils/BasicProvider";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="text-sm text-muted-foreground p-4">Loading editor...</p>,
});

interface ProductVariant {
  _id?: string;
  variantName: string;
  sku: string;
  regularPrice: number;
  salePrice?: number;
  quantity: number | null | "";
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
  signature: boolean;
  categories?: string[];
  productType: "simple" | "variable";
  status: "active" | "inactive";
}

export default function ProductForm({ initialData }: { initialData?: Product }) {
  const { getMethod, postMethod, putMethod, deleteMethod } = BasicProvider();
  const router = useRouter();
  
  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [featuredImagePreview, setFeaturedImagePreview] = useState(initialData?.featuredImage || "");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.galleryImages || []);
  const [regularPrice, setRegularPrice] = useState<number | "">(initialData?.regularPrice ?? "");
  const [salePrice, setSalePrice] = useState<number | "">(initialData?.salePrice ?? "");
  const [quantity, setQuantity] = useState<number | "">(initialData?.quantity === null ? "" : (initialData?.quantity ?? 0));
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [signature, setSignature] = useState((initialData as any)?.signature || false);
  const [productType, setProductType] = useState<"simple" | "variable">(initialData?.productType || "simple");
  const [status, setStatus] = useState<"active" | "inactive">(initialData?.status || "active");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories || []);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});



  useEffect(() => {
    const initData = async () => {
      // Fetch categories
      try {
        const data = await getMethod("/api/categories");
        if (data && data.success) {
          setAllCategories(data.categories.filter((c: any) => c.type?.toLowerCase() === "product" || !c.type || c.type === "General"));
        }
      } catch (error) {
        console.error("Failed to fetch categories");
      }

      // Fetch variants if editing a variable product
      if (initialData?.productType === "variable") {
        try {
            const data = await getMethod(`/api/products/${initialData._id}`);
            if (data && data.success && data.variants) {
                setVariants(data.variants);
            }
        } catch (error) {
            toast.error("Failed to load variants");
        }
      }
    };
    initData();
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isGallery) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, featuredImage: "Image size must be less than 2MB" }));
        return;
      }
      setErrors(prev => ({ ...prev, featuredImage: "" }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
         if (file.size <= 2 * 1024 * 1024) {
             const reader = new FileReader();
             reader.onloadend = () => {
                 setGalleryPreviews(prev => [...prev, reader.result as string]);
             };
             reader.readAsDataURL(file);
         }
      });
    }
  };

  const removeFeaturedImage = () => setFeaturedImagePreview("");
  const removeGalleryImage = (index: number) => {
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
       if (file.size <= 2 * 1024 * 1024) {
           const reader = new FileReader();
           reader.onloadend = () => {
               setVariants(prev => prev.map((variant, i) => {
                   if (i === index) {
                       return {
                           ...variant,
                           galleryImages: [...(variant.galleryImages || []), reader.result as string]
                       };
                   }
                   return variant;
               }));
           };
           reader.readAsDataURL(file);
       } else {
           toast.error("Some images were larger than 2MB and skipped");
       }
    });
  };

  const removeVariantGalleryImage = (variantIndex: number, imageIndex: number) => {
      setVariants(prev => prev.map((variant, i) => {
          if (i === variantIndex) {
              return {
                  ...variant,
                  galleryImages: (variant.galleryImages || []).filter((_, imgIdx) => imgIdx !== imageIndex)
              };
          }
          return variant;
      }));
  };

  const uploadImage = async (base64Img: string) => {
      if (!base64Img.startsWith("data:")) return base64Img; // already uploaded URL
      
      const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Img }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadData || !uploadData.success) {
          throw new Error(uploadData?.message || "Image upload failed.");
      }
      return uploadData.url;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required";
    
    if (productType === "simple") {
        if (regularPrice === "") newErrors.regularPrice = "Regular price is required";
        if (Number(regularPrice) < 0) newErrors.regularPrice = "Price cannot be negative";
        if (salePrice !== "" && Number(salePrice) > Number(regularPrice)) newErrors.salePrice = "Sale price cannot be greater than regular price";
        if (quantity !== "" && Number(quantity) < 0) newErrors.quantity = "Quantity cannot be negative";
        if (!featuredImagePreview) newErrors.featuredImage = "Featured image is required";
    }
    
    if (productType === "variable" && variants.length === 0) {
        newErrors.variants = "Variable products must have at least one variant";
        toast.error("Variable products must have at least one variant");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    try {
      setSubmitting(true);
      
      let finalFeaturedImage = "";
      let finalGalleryImages: string[] = [];
      
      if (productType === "simple") {
          if (featuredImagePreview) {
              finalFeaturedImage = await uploadImage(featuredImagePreview);
          }
          for (const img of galleryPreviews) {
              finalGalleryImages.push(await uploadImage(img));
          }
      }

      const finalVariants = [];
      for (const v of variants) {
          const vGallery: string[] = [];
          if (v.galleryImages && v.galleryImages.length > 0) {
              for (const img of v.galleryImages) {
                  vGallery.push(await uploadImage(img));
              }
          }
          finalVariants.push({
              ...v,
              galleryImages: vGallery,
              quantity: v.quantity === "" ? null : Number(v.quantity)
          });
      }

      const payload = { 
        name, 
        shortDescription,
        description,
        featuredImage: finalFeaturedImage,
        galleryImages: finalGalleryImages,
        regularPrice: regularPrice === "" ? 0 : Number(regularPrice),
        salePrice: salePrice === "" ? undefined : Number(salePrice),
        quantity: quantity === "" ? null : Number(quantity),
        featured,
        signature,
        categories: selectedCategories,
        productType,
        status,
        variants: finalVariants
      };
      
      let data;
      if (initialData) {
        data = await putMethod(`/api/products/${initialData._id}`, payload);
      } else {
        data = await postMethod("/api/products", payload);
      }
      
      if (data && data.success) {
        toast.success(`Product ${initialData ? "updated" : "created"} successfully`);
        router.push("/admin/products");
      } else {
        toast.error(data?.message || `Failed to ${initialData ? "update" : "create"} product`);
      }
    } catch (error: any) {
      toast.error(error.message || "Error saving product");
    } finally {
      setSubmitting(false);
    }
  };



  const addVariant = () => {
      setVariants([...variants, {
          variantName: "",
          sku: "",
          regularPrice: 0,
          quantity: "",
          galleryImages: [],
          status: "active"
      }]);
  };
  
  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
      const newVariants = [...variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      setVariants(newVariants);
  };
  
  const removeVariant = (index: number) => {
      setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-foreground">
            {initialData ? "Edit Product" : "Add New Product"}
          </h2>
          <button type="button" onClick={() => router.push("/admin/products")} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1">
            <X size={16} /> Cancel
          </button>
        </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Basic Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gold border-b border-white/5 pb-2">Basic Info</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Product Name <span className="text-red-500">*</span></label>
                        <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                        }}
                        className={`w-full bg-surface/50 border ${errors.name ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Short Description</label>
                        <div className="quill-dark bg-surface/50 border border-white/10 rounded-xl overflow-hidden transition-colors focus-within:border-gold">
                            <ReactQuill 
                                theme="snow" 
                                value={shortDescription} 
                                onChange={setShortDescription}
                                className="text-sm text-foreground"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Description</label>
                        <div className="quill-dark bg-surface/50 border border-white/10 rounded-xl overflow-hidden transition-colors focus-within:border-gold">
                            <ReactQuill 
                                theme="snow" 
                                value={description} 
                                onChange={setDescription}
                                className="text-sm text-foreground"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                            <select
                                value={productType}
                                onChange={(e) => setProductType(e.target.value as "simple" | "variable")}
                                className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
                            >
                                <option value="simple" className="bg-surface">Simple Product</option>
                                <option value="variable" className="bg-surface">Variable Product</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                                className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
                            >
                                <option value="active" className="bg-surface">Active</option>
                                <option value="inactive" className="bg-surface">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Categories</label>
                        <div className="bg-surface/50 border border-white/10 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-all pr-2">
                            {allCategories.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No categories available. Please create categories first.</p>
                            ) : (
                                allCategories.map((cat) => (
                                    <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={selectedCategories.includes(cat._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCategories([...selectedCategories, cat._id]);
                                                    } else {
                                                        setSelectedCategories(selectedCategories.filter(id => id !== cat._id));
                                                    }
                                                }}
                                            />
                                            <div className="w-5 h-5 rounded border border-white/20 bg-black/20 peer-checked:bg-gold peer-checked:border-gold peer-checked:[&>svg]:opacity-100 transition-colors flex items-center justify-center">
                                                <svg className="w-3 h-3 text-primary-foreground opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="text-sm text-foreground/80 group-hover:text-gold transition-colors">{cat.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-surface/50 border border-white/10 rounded-xl px-4 py-3">
                        <label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setFeatured(!featured)}>
                        Featured Product
                        </label>
                        <button
                        type="button"
                        onClick={() => setFeatured(!featured)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            featured ? "bg-gold" : "bg-white/10"
                        }`}
                        >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${
                            featured ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                        </button>
                    </div>
                    <div className="flex items-center justify-between bg-surface/50 border border-white/10 rounded-xl px-4 py-3">
                        <div>
                          <label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setSignature(!signature)}>
                            Signature Dish
                          </label>
                          <p className="text-xs text-muted-foreground mt-0.5">Show in "Signature Dishes" on homepage</p>
                        </div>
                        <button
                        type="button"
                        onClick={() => setSignature(!signature)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            signature ? "bg-gold" : "bg-white/10"
                        }`}
                        >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${
                            signature ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                        </button>
                    </div>
                </div>

                {/* Pricing & Media */}
                {productType === "simple" && (
                  <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gold border-b border-white/5 pb-2">Pricing & Inventory</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Regular Price <span className="text-red-500">*</span></label>
                              <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={regularPrice}
                                  onChange={(e) => {
                                      setRegularPrice(e.target.value ? Number(e.target.value) : "");
                                      if (errors.regularPrice) setErrors(prev => ({ ...prev, regularPrice: "" }));
                                  }}
                                  className={`w-full bg-surface/50 border ${errors.regularPrice ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                              />
                              {errors.regularPrice && <p className="text-xs text-red-400 mt-1">{errors.regularPrice}</p>}
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Sale Price (Optional)</label>
                              <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salePrice}
                                  onChange={(e) => {
                                      setSalePrice(e.target.value ? Number(e.target.value) : "");
                                      if (errors.salePrice) setErrors(prev => ({ ...prev, salePrice: "" }));
                                  }}
                                  className={`w-full bg-surface/50 border ${errors.salePrice ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                              />
                              {errors.salePrice && <p className="text-xs text-red-400 mt-1">{errors.salePrice}</p>}
                          </div>
                      </div>
                      
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Quantity In Stock <span className="text-xs font-normal">(Leave empty for unlimited)</span></label>
                          <input
                              type="number"
                              min="0"
                              value={quantity ?? ""}
                              onChange={(e) => {
                                  setQuantity(e.target.value === "" ? "" : Number(e.target.value));
                                  if (errors.quantity) setErrors(prev => ({ ...prev, quantity: "" }));
                              }}
                              placeholder="Unlimited"
                              className={`w-full bg-surface/50 border ${errors.quantity ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors`}
                          />
                          {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>}
                      </div>
  
                      <h3 className="text-lg font-medium text-gold border-b border-white/5 pb-2 mt-8">Media</h3>
                      
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Featured Image <span className="text-red-500">*</span></label>
                          {featuredImagePreview ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden group">
                              <img src={featuredImagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                  type="button"
                                  onClick={removeFeaturedImage}
                                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                              </div>
                          </div>
                          ) : (
                          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${errors.featuredImage ? "border-red-500/50" : "border-white/10"} rounded-xl cursor-pointer hover:border-gold/50 hover:bg-white/5 transition-all`}>
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground">Click to upload image</p>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, false)} />
                          </label>
                          )}
                          {errors.featuredImage && <p className="text-xs text-red-400 mt-1">{errors.featuredImage}</p>}
                      </div>
  
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Product Gallery (Optional)</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {galleryPreviews.map((preview, index) => (
                                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                      <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <button
                                              type="button"
                                              onClick={() => removeGalleryImage(index)}
                                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                              <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-gold/50 hover:bg-white/5 transition-all">
                                  <div className="flex flex-col items-center justify-center">
                                      <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Add Image</span>
                                  </div>
                                  <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageChange(e, true)} />
                              </label>
                          </div>
                      </div>
                  </div>
                )}
              </div>

              {/* Variants Section */}
              {productType === "variable" && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gold">Product Variants</h3>
                          <button
                            type="button"
                            onClick={addVariant}
                            className="text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                              <Plus size={14} /> Add Variant
                          </button>
                      </div>
                      
                      {variants.length === 0 ? (
                          <div className="text-center py-8 bg-surface/30 rounded-xl border border-dashed border-white/10">
                              <p className="text-sm text-muted-foreground">No variants added yet. Click "Add Variant" to create one.</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {variants.map((variant, index) => (
                                  <div key={index} className="bg-surface/50 p-4 rounded-xl border border-white/5 relative group">
                                      <button
                                          type="button"
                                          onClick={() => removeVariant(index)}
                                          className="absolute top-2 right-2 p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                      
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                          <div className="space-y-1">
                                              <label className="text-xs text-muted-foreground">Variant Name *</label>
                                              <input
                                                  type="text"
                                                  value={variant.variantName}
                                                  onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                                                  placeholder="e.g. Small / Red"
                                                  required
                                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-xs text-muted-foreground">SKU</label>
                                              <input
                                                  type="text"
                                                  value={variant.sku}
                                                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-xs text-muted-foreground">Reg. Price *</label>
                                              <input
                                                  type="number"
                                                  min="0"
                                                  step="0.01"
                                                  required
                                                  value={variant.regularPrice}
                                                  onChange={(e) => updateVariant(index, 'regularPrice', Number(e.target.value))}
                                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-xs text-muted-foreground">Sale Price</label>
                                              <input
                                                  type="number"
                                                  min="0"
                                                  step="0.01"
                                                  value={variant.salePrice || ""}
                                                  onChange={(e) => updateVariant(index, 'salePrice', e.target.value ? Number(e.target.value) : undefined)}
                                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-xs text-muted-foreground">Qty (Empty=Unlimited)</label>
                                              <input
                                                  type="number"
                                                  min="0"
                                                  value={variant.quantity ?? ""}
                                                  onChange={(e) => updateVariant(index, 'quantity', e.target.value === "" ? "" : Number(e.target.value))}
                                                  placeholder="Unlimited"
                                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                                              />
                                          </div>
                                          <div className="space-y-1">
                                              <label className="text-xs text-muted-foreground">Status</label>
                                              <select
                                                  value={variant.status}
                                                  onChange={(e) => updateVariant(index, 'status', e.target.value)}
                                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
                                              >
                                                  <option value="active" className="bg-surface">Active</option>
                                                  <option value="inactive" className="bg-surface">Inactive</option>
                                              </select>
                                          </div>
                                      </div>

                                      <div className="mt-4 pt-4 border-t border-white/5">
                                          <div className="space-y-2">
                                              <label className="text-xs font-medium text-muted-foreground">Variant Images</label>
                                              <div className="flex flex-wrap gap-2">
                                                  {(variant.galleryImages || []).map((img, imgIndex) => (
                                                      <div key={imgIndex} className="relative w-16 h-16 rounded-md overflow-hidden group border border-white/10 shrink-0">
                                                          <img src={img} alt={`Gallery ${imgIndex}`} className="w-full h-full object-cover" />
                                                          <button
                                                              type="button"
                                                              onClick={() => removeVariantGalleryImage(index, imgIndex)}
                                                              className="absolute top-0.5 right-0.5 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                          >
                                                              <X className="w-2.5 h-2.5" />
                                                          </button>
                                                      </div>
                                                  ))}
                                                  <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-white/10 rounded-md cursor-pointer hover:border-gold/50 hover:bg-white/5 transition-all shrink-0">
                                                      <Plus className="w-4 h-4 text-muted-foreground" />
                                                      <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleVariantImageChange(index, e)} />
                                                  </label>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    className="px-6 py-3 rounded-xl border border-white/10 text-muted-foreground hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 bg-gradient-gold text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:shadow-gold transition-all disabled:opacity-50"
                >
                    {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                    <>
                        {initialData ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {initialData ? "Save Changes" : "Create Product"}
                    </>
                    )}
                </button>
              </div>
            </form>
          </div>
    </div>
  );
}
