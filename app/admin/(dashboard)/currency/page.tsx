"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Edit2, CheckCircle2, CircleDollarSign, X } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import BasicProvider from "@/utils/BasicProvider";

interface Currency {
  _id: string;
  name: string;
  code: string;
  symbol: string;
  isDefault: boolean;
}

export default function CurrencyPage() {
  const { getMethod, postMethod, putMethod, deleteMethod } = BasicProvider();
  
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<{name?: string; code?: string; symbol?: string}>({});

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await getMethod("/api/currency");
      if (res?.success) {
        setCurrencies(res.currencies);
      } else {
        toast.error(res?.message || "Failed to fetch currencies");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (currency?: Currency) => {
    if (currency) {
      setEditingId(currency._id);
      setName(currency.name);
      setCode(currency.code);
      setSymbol(currency.symbol);
      setIsDefault(currency.isDefault);
    } else {
      setEditingId(null);
      setName("");
      setCode("");
      setSymbol("");
      setIsDefault(false);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {name?: string; code?: string; symbol?: string} = {};
    if (!name.trim()) newErrors.name = "Currency name is required";
    if (!code.trim()) newErrors.code = "Code is required";
    if (!symbol.trim()) newErrors.symbol = "Symbol is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const payload = { name, code, symbol, isDefault };
      
      let res;
      if (editingId) {
        res = await putMethod(`/api/currency/${editingId}`, payload);
      } else {
        res = await postMethod("/api/currency", payload);
      }

      if (res?.success) {
        toast.success(res.message);
        closeModal();
        fetchCurrencies();
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await putMethod(`/api/currency/${id}`, { isDefault: true });
      if (res?.success) {
        toast.success("Default currency updated");
        fetchCurrencies();
      } else {
        toast.error(res?.message || "Failed to update default currency");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#111",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteMethod(`/api/currency/${id}`);
          if (res?.success) {
            Swal.fire({
              title: "Deleted!",
              text: "Currency has been deleted.",
              icon: "success",
              background: "#111",
              color: "#fff",
            });
            fetchCurrencies();
          } else {
            toast.error(res?.message || "Failed to delete currency");
          }
        } catch (error) {
          console.error(error);
          toast.error("An error occurred while deleting");
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-2">
            <CircleDollarSign className="text-gold" />
            Currencies
          </h1>
          <p className="text-muted-foreground mt-1">Manage accepted currencies and set your default shop currency.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-gold text-primary-foreground px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-gold transition-all font-medium"
        >
          <Plus size={20} />
          Add Currency
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="bg-surface/50 border border-foreground/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/10 text-muted-foreground text-sm bg-black/20">
                  <th className="py-4 px-6 font-medium">Currency Name</th>
                  <th className="py-4 px-6 font-medium">Code</th>
                  <th className="py-4 px-6 font-medium">Symbol</th>
                  <th className="py-4 px-6 font-medium">Default</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currencies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No currencies found. Please add one.
                    </td>
                  </tr>
                ) : (
                  currencies.map((currency) => (
                    <tr key={currency._id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors group">
                      <td className="py-4 px-6 font-medium">{currency.name}</td>
                      <td className="py-4 px-6">{currency.code}</td>
                      <td className="py-4 px-6 font-serif font-bold text-gold text-lg">{currency.symbol}</td>
                      <td className="py-4 px-6">
                        {currency.isDefault ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full w-max">
                            <CheckCircle2 size={14} />
                            Default
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(currency._id)}
                            className="text-xs font-medium text-muted-foreground hover:text-white bg-foreground/5 hover:bg-foreground/10 px-2.5 py-1 rounded-full transition-colors w-max"
                          >
                            Set as Default
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => openModal(currency)}
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(currency._id)}
                            disabled={currency.isDefault}
                            className={`p-2 rounded-lg transition-colors ${
                              currency.isDefault 
                              ? "text-muted-foreground cursor-not-allowed opacity-50" 
                              : "text-red-400 hover:bg-red-400/10"
                            }`}
                            title={currency.isDefault ? "Cannot delete default currency" : "Delete"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-foreground/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-foreground/5">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Currency" : "Add New Currency"}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 text-muted-foreground hover:text-white hover:bg-foreground/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Currency Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. US Dollar"
                  className={`w-full bg-black/40 border ${errors.name ? 'border-red-500' : 'border-foreground/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors text-white placeholder:text-muted-foreground/50`}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (errors.code) setErrors(prev => ({ ...prev, code: undefined }));
                    }}
                    placeholder="e.g. USD"
                    className={`w-full bg-black/40 border ${errors.code ? 'border-red-500' : 'border-foreground/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors text-white placeholder:text-muted-foreground/50 uppercase`}
                  />
                  {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Symbol *</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => {
                      setSymbol(e.target.value);
                      if (errors.symbol) setErrors(prev => ({ ...prev, symbol: undefined }));
                    }}
                    placeholder="e.g. $"
                    className={`w-full bg-black/40 border ${errors.symbol ? 'border-red-500' : 'border-foreground/10'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors text-white placeholder:text-muted-foreground/50`}
                  />
                  {errors.symbol && <p className="text-xs text-red-500">{errors.symbol}</p>}
                </div>
              </div>

              <div className="pt-2 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded bg-transparent peer-checked:bg-gold peer-checked:border-gold transition-colors flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-black opacity-0 peer-checked:opacity-100" />
                      </div>
                    </div>
                    <span className="text-sm text-foreground group-hover:text-gold transition-colors">
                      Set as default currency
                    </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-foreground/10 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-foreground/10 hover:bg-foreground/5 text-muted-foreground hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-gradient-gold text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:shadow-gold transition-all disabled:opacity-50 text-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Add Currency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
