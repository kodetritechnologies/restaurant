"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload, Plus, ArrowLeft } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { confirmDelete } from "@/utils/swal";

interface ChefItem {
  _id: string;
  name: string;
  role: string;
  experience?: string;
  image: string;
  publicId: string;
  facebook: string;
  instagram: string;
  twitter: string;
  createdAt: string;
}

export default function ChefsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 1;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [chefs, setChefs] = useState<ChefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [filePreview, setFilePreview] = useState("");
  const [publicId, setPublicId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  const { getMethod, postMethod, putMethod, deleteMethod } = BasicProvider();

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const data = await getMethod(`/api/chefs?page=${currentPage}&limit=${itemsPerPage}`);
      if (data && data.success) {
        setChefs(data.chefs);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.chefs.length);
      } else {
        toast.error("Failed to load chefs profiles.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading chefs team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, [currentPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
        if (errors.filePreview) setErrors(prev => ({ ...prev, filePreview: "" }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleEditChef = (chef: ChefItem) => {
    setEditingId(chef._id);
    setFilePreview(chef.image);
    setPublicId(chef.publicId);
    setName(chef.name);
    setRole(chef.role);
    setExperience(chef.experience || "");
    setFacebook(chef.facebook || "");
    setInstagram(chef.instagram || "");
    setTwitter(chef.twitter || "");
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFilePreview("");
    setPublicId("");
    setName("");
    setRole("");
    setExperience("");
    setFacebook("");
    setInstagram("");
    setTwitter("");
    setErrors({});
  };

  const handleSaveChef = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!filePreview) newErrors.filePreview = "Please upload a profile photo";
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = "Chef name is required";
    } else if (trimmedName.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    if (!role.trim()) newErrors.role = "Role is required";

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
        const uploadData = await postMethod("/api/upload", { file: filePreview });

        if (!uploadData || !uploadData.success) {
          throw new Error(uploadData?.message || "Cloudinary upload failed.");
        }
        finalImageUrl = uploadData.url;
        finalPublicId = uploadData.public_id;
      }

      const payload = {
        name: name.trim(),
        role: role.trim(),
        experience: experience.trim(),
        image: finalImageUrl,
        publicId: finalPublicId,
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        twitter: twitter.trim(),
      };

      let saveRes;
      if (editingId) {
        saveRes = await putMethod(`/api/chefs/${editingId}`, payload);
      } else {
        saveRes = await postMethod("/api/chefs", payload);
      }
      
      if (saveRes && saveRes.success) {
        toast.success(editingId ? "Chef profile updated successfully!" : "Chef profile created successfully!");
        handleCancelEdit();
        fetchChefs();
      } else {
        toast.error(saveRes.message || "Failed to save chef profile.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during chef profile save.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteChef = async (id: string) => {
    const result = await confirmDelete("You won't be able to revert this chef profile deletion!");

    if (!result.isConfirmed) return;

    try {
      const data = await deleteMethod(`/api/chefs/${id}`);
      if (data && data.success) {
        toast.success("Chef profile deleted successfully.");
        fetchChefs();
      } else {
        toast.error(data.message || "Failed to delete chef profile.");
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
          className="p-2 border border-foreground/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
            Chefs Team Management
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
            Add team profiles, upload photos, and manage active kitchen crew
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload/Add Form */}
        <form noValidate onSubmit={handleSaveChef} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5">
            {editingId ? "Edit Chef Profile" : "Add Chef Profile"}
          </h3>

          <div className="space-y-4">
            {/* Profile Photo */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Profile Photo
              </label>
              <div className="relative group flex flex-col items-center justify-center border border-dashed border-foreground/20 rounded-2xl p-4 bg-background/40 hover:border-gold/50 transition-colors">
                {filePreview ? (
                  <div className="relative w-full aspect-square max-w-[200px] rounded-full overflow-hidden border border-foreground/10">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFilePreview("")}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-black/75 rounded-full text-white hover:bg-black transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-6 cursor-pointer w-full h-full">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-gold transition-colors mb-2" />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">Click to upload photo</span>
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

            {/* Name */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Chef Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sanjeev Kapoor"
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

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Executive Chef"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (errors.role) setErrors({ ...errors, role: "" });
                }}
                className={`w-full bg-background/50 border px-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                  errors.role ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                }`}
              />
              {errors.role && <span className="text-[10px] text-red-400 mt-1 block">{errors.role}</span>}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Experience
              </label>
              <input
                type="text"
                placeholder="e.g. 15 Years, Michelin Starred"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-background/50 border border-foreground/10 px-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* Social Handles */}
            <div className="space-y-3 pt-3 border-t border-foreground/5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gold/80">
                Social Profile Handles
              </label>

              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Instagram handle/URL"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Facebook handle/URL"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Twitter handle/URL"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>
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
                  <span>{editingId ? "Updating..." : "Creating profile..."}</span>
                </>
              ) : (
                <>
                  {editingId ? null : <Plus className="h-4 w-4" />}
                  <span>{editingId ? "Update Profile" : "Add Chef Profile"}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={uploading}
                className="rounded-full bg-foreground/5 border border-foreground/10 px-6 py-3.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:bg-foreground/10 hover:text-foreground disabled:opacity-75"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Chefs List */}
        <div className="glass overflow-hidden rounded-2xl border border-foreground/5 shadow-elegant lg:col-span-2 flex flex-col h-fit">
          <div className="p-6 sm:p-8 border-b border-foreground/5">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Active Culinary Team
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/5 bg-surface/70 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-4 px-3 md:px-4">Profile</th>
                  <th className="py-4 px-3 md:px-4">Experience</th>
                  <th className="py-4 px-3 md:px-4">Social Links</th>
                  <th className="py-4 px-3 md:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
                        Retrieving team profiles...
                      </p>
                    </td>
                  </tr>
                ) : chefs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-muted-foreground">
                      No chef profiles registered. Add profiles using the form on the left!
                    </td>
                  </tr>
                ) : (
                  chefs.map((chef) => (
                    <tr key={chef._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-3 md:px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden bg-muted shrink-0 border border-foreground/10">
                            <img src={chef.image} alt={chef.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{chef.name}</div>
                            <div className="text-xs text-gold uppercase tracking-wider font-semibold mt-0.5">{chef.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 md:px-4 max-w-[150px] truncate" title={chef.experience}>
                        {chef.experience ? (
                          <span className="text-xs text-muted-foreground">{chef.experience}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">None provided</span>
                        )}
                      </td>
                      <td className="py-4 px-3 md:px-4">
                        <div className="flex gap-2.5 text-muted-foreground">
                          {chef.instagram && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                          )}
                          {chef.facebook && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                            </svg>
                          )}
                          {chef.twitter && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                          )}
                          {!chef.instagram && !chef.facebook && !chef.twitter && (
                            <span className="text-xs text-muted-foreground/50 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3 md:px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditChef(chef)}
                            className="p-1.5 md:p-2 bg-foreground/5 hover:bg-gold/15 border border-foreground/10 hover:border-gold/30 text-muted-foreground hover:text-gold rounded-lg transition-colors cursor-pointer"
                            title="Edit Chef Profile"
                          >
                            <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteChef(chef._id)}
                            className="p-1.5 md:p-2 bg-foreground/5 hover:bg-destructive/15 border border-foreground/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive-foreground rounded-lg transition-colors cursor-pointer"
                            title="Delete Chef Profile"
                          >
                            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center pt-6 pb-6 gap-3">
              <Pagination data={{ currentPage, totalPages }} isAdmin={true} />
              <span className="text-xs text-muted-foreground">
                Showing {chefs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} profiles
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
