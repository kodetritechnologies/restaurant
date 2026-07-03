"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload, Plus, ArrowLeft } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface GalleryItem {
  _id: string;
  url: string;
  publicId: string;
  title: string;
  category: "Food" | "Drinks" | "Interior" | "Events";
  createdAt: string;
}

export default function GalleryManager() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [filePreview, setFilePreview] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GalleryItem["category"]>("Interior");

  const { getMethod, postMethod, deleteMethod } = BasicProvider();

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await getMethod("/api/gallery");
      if (data && data.success) {
        setItems(data.items);
      } else {
        toast.error("Failed to load gallery items.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading gallery data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePreview) {
      toast.error("Please select an image file to upload.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Cloudinary via server upload API
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: filePreview }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadData || !uploadData.success) {
        throw new Error(uploadData?.message || "Cloudinary upload failed.");
      }

      // 2. Save reference to MongoDB
      const payload = {
        url: uploadData.url,
        publicId: uploadData.public_id,
        title: title.trim(),
        category,
      };

      const saveRes = await postMethod("/api/gallery", payload);
      if (saveRes && saveRes.success) {
        toast.success("Image uploaded and added to gallery successfully!");
        setFilePreview("");
        setTitle("");
        setCategory("Interior");
        fetchGallery();
      } else {
        toast.error(saveRes.message || "Failed to save gallery item.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;

    try {
      const data = await deleteMethod(`/api/gallery/${id}`);
      if (data && data.success) {
        toast.success("Gallery image deleted successfully.");
        fetchGallery();
      } else {
        toast.error(data.message || "Failed to delete gallery item.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="p-2 border border-white/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
            Gallery Management
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
            Upload images to Cloudinary and organize landing categories
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Form */}
        <form onSubmit={handleUploadImage} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-white/5 pb-2.5">
            Upload Image
          </h3>

          <div className="space-y-4">
            {/* File upload preview box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Select Photo
              </label>
              <div className="relative group flex flex-col items-center justify-center border border-dashed border-white/20 rounded-2xl p-4 bg-background/40 hover:border-gold/50 transition-colors">
                {filePreview ? (
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFilePreview("")}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-6 cursor-pointer w-full h-full">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-gold transition-colors mb-2" />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Image Title
              </label>
              <input
                type="text"
                placeholder="e.g. Signature Ribeye Steak"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background/50 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryItem["category"])}
                className="w-full bg-background border border-white/10 px-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold cursor-pointer"
              >
                <option value="Food">Food & Dishes</option>
                <option value="Drinks">Drinks & Cocktails</option>
                <option value="Interior">Restaurant Interior</option>
                <option value="Events">Private Events</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-full bg-gradient-gold px-6 py-3.5 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01] disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Uploading image...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add to Gallery</span>
              </>
            )}
          </button>
        </form>

        {/* Gallery Grid */}
        <div className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 lg:col-span-2">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-white/5 pb-2.5">
            Active Gallery Items
          </h3>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
                Retrieving gallery items...
              </p>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              No photos uploaded yet. Use the uploader form on the left to start!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="relative group border border-white/5 bg-background/20 rounded-2xl overflow-hidden shadow-elegant hover:border-gold/30 transition-all hover:scale-[1.01]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-bold text-gold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.title || "Untitled"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-1.5 bg-white/5 hover:bg-destructive/15 border border-white/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive-foreground rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Delete Image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
