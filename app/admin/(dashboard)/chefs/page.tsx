"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload, Plus, ArrowLeft } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ChefItem {
  _id: string;
  name: string;
  role: string;
  image: string;
  publicId: string;
  facebook: string;
  instagram: string;
  twitter: string;
  createdAt: string;
}

export default function ChefsManager() {
  const router = useRouter();
  const [chefs, setChefs] = useState<ChefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [filePreview, setFilePreview] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  const { getMethod, postMethod, deleteMethod } = BasicProvider();

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const data = await getMethod("/api/chefs");
      if (data && data.success) {
        setChefs(data.chefs);
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

  const handleAddChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePreview) {
      toast.error("Please upload a profile photo for the chef.");
      return;
    }
    if (!name.trim() || !role.trim()) {
      toast.error("Please enter both the chef's name and role.");
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
        name: name.trim(),
        role: role.trim(),
        image: uploadData.url,
        publicId: uploadData.public_id,
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        twitter: twitter.trim(),
      };

      const saveRes = await postMethod("/api/chefs", payload);
      if (saveRes && saveRes.success) {
        toast.success("Chef profile created successfully!");
        setFilePreview("");
        setName("");
        setRole("");
        setFacebook("");
        setInstagram("");
        setTwitter("");
        fetchChefs();
      } else {
        toast.error(saveRes.message || "Failed to save chef profile.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during chef profile creation.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteChef = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chef profile?")) return;

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
          className="p-2 border border-white/10 hover:border-gold/40 text-muted-foreground hover:text-gold rounded-full transition-colors cursor-pointer"
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
        <form onSubmit={handleAddChef} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-white/5 pb-2.5">
            Add Chef Profile
          </h3>

          <div className="space-y-4">
            {/* Profile Photo */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Profile Photo
              </label>
              <div className="relative group flex flex-col items-center justify-center border border-dashed border-white/20 rounded-2xl p-4 bg-background/40 hover:border-gold/50 transition-colors">
                {filePreview ? (
                  <div className="relative w-full aspect-square max-w-[200px] rounded-full overflow-hidden border border-white/10">
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
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Chef Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jean-Luc Auréa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background/50 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
              />
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
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full bg-background/50 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
              />
            </div>

            {/* Social Handles */}
            <div className="space-y-3 pt-3 border-t border-white/5">
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
                    className="w-full bg-background/50 border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground outline-none focus:border-gold"
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
                    className="w-full bg-background/50 border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground outline-none focus:border-gold"
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
                    className="w-full bg-background/50 border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>
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
                <span>Creating profile...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add Chef Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Chefs Grid */}
        <div className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 lg:col-span-2">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-white/5 pb-2.5">
            Active Culinary Team
          </h3>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
                Retrieving team profiles...
              </p>
            </div>
          ) : chefs.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              No chef profiles registered. Add profiles using the form on the left!
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {chefs.map((chef) => (
                <div
                  key={chef._id}
                  className="flex border border-white/5 bg-background/20 rounded-2xl p-4 gap-4 items-center shadow-elegant hover:border-gold/30 transition-all hover:scale-[1.01]"
                >
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-muted shrink-0 border border-white/10">
                    <img src={chef.image} alt={chef.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif text-base font-bold text-foreground truncate">{chef.name}</h4>
                    <p className="text-xs text-gold uppercase tracking-wider font-semibold truncate mt-0.5">{chef.role}</p>
                    
                    <div className="flex gap-2.5 mt-2.5 text-muted-foreground">
                      {chef.instagram && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      )}
                      {chef.facebook && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                      )}
                      {chef.twitter && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteChef(chef._id)}
                    className="p-2 bg-white/5 hover:bg-destructive/15 border border-white/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive-foreground rounded-lg transition-colors cursor-pointer shrink-0 align-self-start"
                    title="Delete Chef Profile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
