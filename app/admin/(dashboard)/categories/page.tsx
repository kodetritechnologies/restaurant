"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ListTree, Plus, Loader2, ChevronRight, ChevronDown, Folder, FolderOpen, Trash2, Edit2, UploadCloud, X, Image as ImageIcon, Star } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import BasicProvider from "@/utils/BasicProvider";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image?: string;
  public_id?: string;
  type?: string;
  featured?: boolean;
  description?: string;
  order: number;
}

export default function CategoriesPage() {
  const { getMethod, postMethod, putMethod, deleteMethod } = BasicProvider();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [publicId, setPublicId] = useState("");
  const [categoryType, setCategoryType] = useState("General");
  const [isCustomType, setIsCustomType] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getMethod("/api/categories");
      if (data && data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size must be less than 2MB" }));
      return;
    }

    setErrors(prev => ({ ...prev, image: undefined }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFilePreview("");
    setPublicId("");
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setName(category.name);
    setParentId(category.parent || "");
    setFilePreview(category.image || "");
    setPublicId(category.public_id || "");
    setCategoryType(category.type || "General");
    setIsCustomType(false);
    setFeatured(category.featured || false);
    setDescription(category.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setParentId("");
    setFilePreview("");
    setPublicId("");
    setCategoryType("General");
    setIsCustomType(false);
    setFeatured(false);
    setDescription("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; image?: string } = {};
    if (!name.trim()) newErrors.name = "Category name is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    try {
      setSubmitting(true);
      
      let finalImageUrl = filePreview;
      let finalPublicId = publicId;

      if (filePreview && filePreview.startsWith("data:")) {
        const uploadData = await postMethod("/api/upload", { file: filePreview });

        if (!uploadData || !uploadData.success) {
          throw new Error(uploadData?.message || "Image upload failed.");
        }
        finalImageUrl = uploadData.url;
        finalPublicId = uploadData.public_id;
      }

      const payload = { 
        name, 
        parent: parentId || null,
        image: finalImageUrl,
        public_id: finalPublicId,
        type: categoryType,
        featured,
        description
      };
      
      let data;
      if (editingId) {
        data = await putMethod(`/api/categories/${editingId}`, payload);
      } else {
        data = await postMethod("/api/categories", payload);
      }
      
      if (data && data.success) {
        toast.success(`Category ${editingId ? "updated" : "created"} successfully`);
        resetForm();
        fetchCategories();
      } else {
        toast.error(data?.message || `Failed to ${editingId ? "update" : "create"} category`);
      }
    } catch (error: any) {
      toast.error(error.message || "Error saving category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const data = await deleteMethod(`/api/categories/${id}`);
      if (data && data.success) {
        toast.success("Category deleted");
        if (editingId === id) resetForm();
        fetchCategories();
      } else {
        toast.error(data?.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ListTree className="text-gold" />
            Categories Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and organize categories with images in a hierarchical structure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-foreground/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              {editingId && (
                <button onClick={resetForm} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">
                  <X size={14} /> Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Category Name(s)</span>
                  {!editingId && <span className="text-[10px] text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full">Comma separated</span>}
                </label>
                <textarea
                  rows={3}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder={editingId ? "e.g. Apple" : "e.g. Apple, Banana, Orange"}
                  className={`w-full bg-surface/50 border ${errors.name ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 ${errors.name ? "focus:ring-red-500" : "focus:ring-gold"} transition-colors resize-none`}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Parent Category (Optional)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-surface/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-colors appearance-none"
                >
                  <option value="" className="bg-surface text-muted-foreground">
                    None (Top Level)
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-surface" disabled={cat._id === editingId}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Category Type
                </label>
                {!isCustomType ? (
                  <select
                    value={categoryType}
                    onChange={(e) => {
                      if (e.target.value === "OTHER_CUSTOM_TYPE") {
                        setIsCustomType(true);
                        setCategoryType("");
                      } else {
                        setCategoryType(e.target.value);
                      }
                    }}
                    className="w-full bg-surface/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-colors appearance-none"
                  >
                    {Array.from(new Set(["General", ...categories.map(c => c.type).filter(Boolean)])).map(type => (
                      <option key={type} value={type} className="bg-surface">
                        {type}
                      </option>
                    ))}
                    <option value="OTHER_CUSTOM_TYPE" className="bg-surface text-gold font-medium">
                      + Add Custom Type...
                    </option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryType}
                      onChange={(e) => setCategoryType(e.target.value)}
                      placeholder="Enter custom type..."
                      autoFocus
                      className="w-full bg-surface/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomType(false);
                        setCategoryType("General");
                      }}
                      className="px-4 bg-foreground/5 border border-foreground/10 rounded-xl text-muted-foreground hover:text-white transition-colors flex items-center justify-center"
                      title="Cancel custom type"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-surface/50 border border-foreground/10 rounded-xl px-4 py-3">
                <label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setFeatured(!featured)}>
                  Featured Category
                </label>
                <button
                  type="button"
                  onClick={() => setFeatured(!featured)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    featured ? "bg-gold" : "bg-foreground/10"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${
                      featured ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief summary of this category..."
                  className="w-full bg-surface/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Category Image (Optional)
                </label>
                
                {filePreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden group">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-foreground/10 rounded-xl cursor-pointer hover:border-gold/50 hover:bg-foreground/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Click to upload image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
                {errors.image && <p className="text-xs text-red-400 mt-1">{errors.image}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-gold text-primary-foreground font-semibold px-4 py-3 rounded-xl hover:shadow-gold transition-all disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingId ? "Save Changes" : "Create Category"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* JS Tree Column */}
        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-2xl border border-foreground/10 min-h-[500px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">Category Tree</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-foreground/10 rounded-xl">
                <ListTree className="w-12 h-12 mb-2 opacity-50" />
                <p>No categories found. Create one to get started.</p>
              </div>
            ) : (
              <div className="bg-surface/30 p-4 rounded-xl border border-foreground/5">
                <CategoryTree categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tree Components
const CategoryTree = ({ 
  categories, 
  parentId = null, 
  onEdit,
  onDelete 
}: { 
  categories: Category[]; 
  parentId?: string | null;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}) => {
  const children = categories.filter(c => c.parent === parentId);
  
  if (children.length === 0) return null;

  // Group top-level categories by type
  if (parentId === null) {
    const grouped = children.reduce((acc, cat) => {
      const type = cat.type || "General";
      if (!acc[type]) acc[type] = [];
      acc[type].push(cat);
      return acc;
    }, {} as Record<string, Category[]>);

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([type, typeCategories]) => (
          <div key={type} className="bg-surface/50 p-3 rounded-xl border border-foreground/5">
            <h3 className="text-xs font-semibold text-gold mb-2 uppercase tracking-wider pl-2">{type} Categories</h3>
            <ul className="space-y-1">
              {typeCategories.map(category => (
                <CategoryNode 
                  key={category._id} 
                  category={category} 
                  allCategories={categories}
                  onEdit={onEdit}
                  onDelete={onDelete} 
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className={`space-y-1 pl-6 mt-1 border-l border-foreground/10`}>
      {children.map(category => (
        <CategoryNode 
          key={category._id} 
          category={category} 
          allCategories={categories}
          onEdit={onEdit}
          onDelete={onDelete} 
        />
      ))}
    </ul>
  );
};

const CategoryNode = ({ 
  category, 
  allCategories,
  onEdit,
  onDelete
}: { 
  category: Category; 
  allCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}) => {
  const hasChildren = allCategories.some(c => c.parent === category._id);
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="select-none">
      <div 
        className="group flex items-center justify-between p-2 rounded-lg hover:bg-foreground/5 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          {hasChildren ? (
            <button 
              className="text-muted-foreground hover:text-white transition-colors w-5 h-5 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          {category.image ? (
            <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-foreground/10">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            </div>
          ) : expanded && hasChildren ? (
            <FolderOpen size={18} className="text-gold shrink-0" />
          ) : (
            <Folder size={18} className="text-gold/80 shrink-0" />
          )}
          
          <span className="font-medium text-foreground flex items-center gap-2">
            {category.name}
            {category.featured && <Star size={12} className="text-gold fill-gold" />}
          </span>
          <span className="text-xs text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full ml-2 font-mono">
            {category.slug}
          </span>
          <span className="text-[10px] text-gold/80 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">
            {category.type || "General"}
          </span>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
            title="Edit Category"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category._id);
            }}
            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-all"
            title="Delete Category"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        {expanded && hasChildren && (
          <CategoryTree 
            categories={allCategories} 
            parentId={category._id} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </motion.div>
    </li>
  );
};
