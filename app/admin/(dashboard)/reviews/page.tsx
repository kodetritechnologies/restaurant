"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Plus, Trash2, Edit2, ArrowLeft, Upload, X } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmDelete } from "@/utils/swal";
import Pagination from "@/components/Pagination";

interface ReviewItem {
  _id: string;
  name: string;
  rating: number;
  text: string;
  imgUrl: string;
  publicId: string;
}

function ReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const itemsPerPage = 10;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // Form states
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");
  
  // Image states
  const [filePreview, setFilePreview] = useState("");
  const [publicId, setPublicId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { getMethod, postMethod, putMethod, deleteMethod } = BasicProvider();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getMethod(`/api/reviews?limit=${itemsPerPage}&page=${currentPage}`);
      if (data && data.success) {
        setReviews(data.reviews);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.reviews.length);
      } else {
        toast.error("Failed to load reviews.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading reviews data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (errors.image) setErrors({ ...errors, image: "" });
  };

  const handleRemoveImage = () => {
    setFilePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditReview = (review: ReviewItem) => {
    setEditingId(review._id);
    setName(review.name);
    setRating(review.rating.toString());
    setText(review.text);
    setFilePreview(review.imgUrl);
    setPublicId(review.publicId);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setRating("5");
    setText("");
    setFilePreview("");
    setPublicId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrors({});
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // JS Validation
    const newErrors: Record<string, string> = {};
    
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length < 10) {
      newErrors.text = "Review text must be at least 10 characters";
    }

    // Image is optional

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      let finalImageUrl = filePreview;
      let finalPublicId = publicId;

      // Only upload if it's a new file (base64)
      if (filePreview.startsWith("data:image")) {
        const uploadData = await postMethod("/api/upload", { file: filePreview, folder: "reviews" });
        
        if (!uploadData || !uploadData.success) {
          toast.error(uploadData.error || uploadData.message || "Failed to upload image");
          setSaving(false);
          return;
        }
        finalImageUrl = uploadData.url;
        finalPublicId = uploadData.public_id;
      }

      const payload = {
        name: trimmedName,
        rating: Number(rating),
        text: trimmedText,
        imgUrl: finalImageUrl,
        publicId: finalPublicId,
      };

      let saveRes;
      if (editingId) {
        saveRes = await putMethod(`/api/reviews/${editingId}`, payload);
      } else {
        saveRes = await postMethod("/api/reviews", payload);
      }
      
      if (saveRes && saveRes.success) {
        toast.success(editingId ? "Review updated successfully!" : "Review created successfully!");
        handleCancelEdit();
        fetchReviews();
      } else {
        toast.error(saveRes.message || "Failed to save review.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during review save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    const result = await confirmDelete("You won't be able to revert this review deletion!");

    if (!result.isConfirmed) return;

    try {
      const data = await deleteMethod(`/api/reviews/${id}`);
      if (data && data.success) {
        toast.success("Review deleted successfully.");
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to delete review.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item.");
    }
  };

  const currentReviews = reviews;

  const paginationData = {
    currentPage,
    totalPages,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="p-2 border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
            Cherished Reviews
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
            Manage guest testimonials and ratings
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload/Add Form */}
        <form noValidate onSubmit={handleSaveReview} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5">
            {editingId ? "Edit Review" : "Add New Review"}
          </h3>

          <div className="space-y-4">
            {/* Image Uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Guest Photo <span className="text-muted-foreground normal-case font-normal">(Optional)</span>
              </label>
              
              {filePreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold mx-auto">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-24 h-24 rounded-full mx-auto border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-background/50 hover:bg-foreground/5 ${
                    errors.image ? "border-red-500/50" : "border-foreground/20 hover:border-gold/50 text-muted-foreground hover:text-gold"
                  }`}
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Upload</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              {errors.image && <span className="text-[10px] text-red-400 mt-1 block text-center">{errors.image}</span>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Guest Name
              </label>
              <input
                type="text"
                placeholder="e.g. Amelia Chen"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`w-full bg-background/50 border px-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                  errors.name ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                }`}
              />
              {errors.name && <span className="text-[10px] text-red-400 mt-1 block">{errors.name}</span>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-background border border-foreground/10 px-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold cursor-pointer"
              >
                <option value="5">5 Stars (★★★★★)</option>
                <option value="4">4 Stars (★★★★☆)</option>
                <option value="3">3 Stars (★★★☆☆)</option>
                <option value="2">2 Stars (★★☆☆☆)</option>
                <option value="1">1 Star (★☆☆☆☆)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Review Text
              </label>
              <textarea
                placeholder="e.g. The ambience alone is worth the visit..."
                value={text}
                rows={4}
                onChange={(e) => {
                  setText(e.target.value);
                  if (errors.text) setErrors({ ...errors, text: "" });
                }}
                className={`w-full bg-background/50 border px-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                  errors.text ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                }`}
              />
              {errors.text && <span className="text-[10px] text-red-400 mt-1 block">{errors.text}</span>}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-gradient-gold px-6 py-3.5 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01] disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{editingId ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  {editingId ? null : <Plus className="h-4 w-4" />}
                  <span>{editingId ? "Update Review" : "Add Review"}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-full bg-foreground/5 border border-foreground/10 px-6 py-3.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:bg-foreground/10 hover:text-foreground disabled:opacity-75"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Reviews List */}
        <div className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 lg:col-span-2">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5">
            Active Reviews
          </h3>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
                Retrieving Reviews...
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              No reviews added yet. Use the form on the left to start adding some!
            </p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-foreground/10">
                <table className="w-full text-left text-sm text-foreground/80">
                  <thead className="bg-foreground/5 text-xs uppercase text-foreground/60">
                    <tr>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3 min-w-[200px]">Review</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    {currentReviews.map((review) => (
                      <tr key={review._id} className="hover:bg-foreground/5 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img src={review.imgUrl || "/assets/no-image-customer.png"} alt={review.name} className="w-8 h-8 rounded-full border border-gold/40 object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/no-image-customer.png"; }} />
                          <span className="font-medium text-foreground whitespace-nowrap">{review.name}</span>
                        </td>
                        <td className="px-4 py-3 text-gold whitespace-nowrap">
                          {"★".repeat(review.rating)}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] sm:max-w-xs truncate" title={review.text}>
                          {review.text}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="p-1.5 bg-foreground/10 hover:bg-gold/80 hover:text-primary-foreground border border-foreground/10 text-muted-foreground rounded-lg transition-colors cursor-pointer backdrop-blur-md"
                              title="Edit Review"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="p-1.5 bg-foreground/10 hover:bg-destructive/80 hover:text-white border border-foreground/10 text-muted-foreground rounded-lg transition-colors cursor-pointer backdrop-blur-md"
                              title="Delete Review"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-center pt-6 pb-6 gap-3">
                  <Pagination data={paginationData} isAdmin={true} />
                  <span className="text-xs text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsManager() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>}>
      <ReviewsContent />
    </Suspense>
  );
}
