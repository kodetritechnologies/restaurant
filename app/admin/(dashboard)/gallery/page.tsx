"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload, Plus, ArrowLeft } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface GalleryItem {
  _id: string;
  url: string;
  publicId: string;
  title: string;
  description?: string;
  category: "Food" | "Drinks" | "Interior" | "Events";
  createdAt: string;
}

export default function GalleryManager() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [filePreview, setFilePreview] = useState("");
  const [publicId, setPublicId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GalleryItem["category"]>("Interior");

  const { getMethod, postMethod, putMethod, deleteMethod } = BasicProvider();

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
        if (errors.filePreview) setErrors((prev) => ({ ...prev, filePreview: "" }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleEditItem = (item: GalleryItem) => {
    setEditingId(item._id);
    setFilePreview(item.url);
    setPublicId(item.publicId);
    setTitle(item.title);
    setDescription(item.description || "");
    setCategory(item.category);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFilePreview("");
    setPublicId("");
    setTitle("");
    setDescription("");
    setCategory("Interior");
    setErrors({});
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!filePreview) newErrors.filePreview = "Please select an image file to upload";
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = "Image title is required";
    } else if (trimmedTitle.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setUploading(true);
    try {
      let finalImageUrl = filePreview;
      let finalPublicId = publicId;

      // Only upload if it's a new base64 image
      if (filePreview.startsWith("data:")) {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: filePreview }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadData || !uploadData.success) {
          throw new Error(uploadData?.message || "Cloudinary upload failed.");
        }
        finalImageUrl = uploadData.url;
        finalPublicId = uploadData.public_id;
      }

      const payload = {
        url: finalImageUrl,
        publicId: finalPublicId,
        title: title.trim(),
        description: description.trim(),
        category,
      };

      let saveRes;
      if (editingId) {
        saveRes = await putMethod(`/api/gallery/${editingId}`, payload);
      } else {
        saveRes = await postMethod("/api/gallery", payload);
      }

      if (saveRes && saveRes.success) {
        toast.success(editingId ? "Gallery image updated successfully!" : "Image uploaded and added to gallery successfully!");
        handleCancelEdit();
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this gallery image deletion!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      background: '#1a1a1a',
      color: '#ffffff',
    });

    if (!result.isConfirmed) return;

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
        <form noValidate onSubmit={handleSaveItem} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-white/5 pb-2.5">
            {editingId ? "Edit Image Details" : "Upload Image"}
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
              {errors.filePreview && <span className="text-[10px] text-red-400 mt-1 block">{errors.filePreview}</span>}
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                className={`w-full bg-background/50 border px-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                  errors.title ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-gold"
                }`}
              />
              {errors.title && <span className="text-[10px] text-red-400 mt-1 block">{errors.title}</span>}
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

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Image Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A beautiful shot of our signature dish..."
                rows={3}
                className="w-full bg-background/50 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 rounded-full bg-gradient-gold px-6 py-3.5 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01] disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{editingId ? "Updating image..." : "Uploading image..."}</span>
                </>
              ) : (
                <>
                  {editingId ? null : <Plus className="h-4 w-4" />}
                  <span>{editingId ? "Update Details" : "Add to Gallery"}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={uploading}
                className="rounded-full bg-white/5 border border-white/10 px-6 py-3.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:text-foreground disabled:opacity-75"
              >
                Cancel
              </button>
            )}
          </div>
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
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.title || "Untitled"}
                      </p>
                      {item.description && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1.5 bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/30 text-muted-foreground hover:text-gold rounded-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1.5 bg-white/5 hover:bg-destructive/15 border border-white/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive-foreground rounded-lg transition-colors cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
