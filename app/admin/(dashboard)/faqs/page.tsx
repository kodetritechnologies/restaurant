"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, ArrowLeft } from "lucide-react";
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export default function FaqsManager() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { getMethod, postMethod, putMethod, deleteMethod } = BasicProvider();

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await getMethod("/api/faqs");
      if (data && data.success) {
        setFaqs(data.faqs);
      } else {
        toast.error("Failed to load FAQs.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading FAQs data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleEditFaq = (faq: FaqItem) => {
    setEditingId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setErrors({});
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      newErrors.question = "Question is required";
    }
    
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      newErrors.answer = "Answer is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const payload = {
        question: trimmedQuestion,
        answer: trimmedAnswer,
      };

      let saveRes;
      if (editingId) {
        saveRes = await putMethod(`/api/faqs/${editingId}`, payload);
      } else {
        saveRes = await postMethod("/api/faqs", payload);
      }
      
      if (saveRes && saveRes.success) {
        toast.success(editingId ? "FAQ updated successfully!" : "FAQ created successfully!");
        handleCancelEdit();
        fetchFaqs();
      } else {
        toast.error(saveRes.message || "Failed to save FAQ.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during FAQ save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this FAQ deletion!",
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
      const data = await deleteMethod(`/api/faqs/${id}`);
      if (data && data.success) {
        toast.success("FAQ deleted successfully.");
        fetchFaqs();
      } else {
        toast.error(data.message || "Failed to delete FAQ.");
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
            FAQ Management
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
            Add and manage frequently asked questions for your website
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload/Add Form */}
        <form noValidate onSubmit={handleSaveFaq} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-white/5 pb-2.5">
            {editingId ? "Edit FAQ" : "Add New FAQ"}
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Question
              </label>
              <input
                type="text"
                placeholder="e.g. Do you offer vegetarian options?"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (errors.question) setErrors({ ...errors, question: "" });
                }}
                className={`w-full bg-background/50 border px-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                  errors.question ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-gold"
                }`}
              />
              {errors.question && <span className="text-[10px] text-red-400 mt-1 block">{errors.question}</span>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                Answer
              </label>
              <textarea
                placeholder="e.g. Yes, we have a dedicated vegetarian menu..."
                value={answer}
                rows={4}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (errors.answer) setErrors({ ...errors, answer: "" });
                }}
                className={`w-full bg-background/50 border px-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                  errors.answer ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-gold"
                }`}
              />
              {errors.answer && <span className="text-[10px] text-red-400 mt-1 block">{errors.answer}</span>}
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
                  <span>{editingId ? "Update FAQ" : "Add FAQ"}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-full bg-white/5 border border-white/10 px-6 py-3.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:text-foreground disabled:opacity-75"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* FAQs List */}
        <div className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 lg:col-span-2">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-white/5 pb-2.5">
            Active FAQs
          </h3>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
                Retrieving FAQs...
              </p>
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">
              No FAQs added yet. Use the form on the left to start adding some!
            </p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="group flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-background/20 hover:border-gold/30 transition-all shadow-elegant"
                >
                  <div className="flex-1 space-y-1.5">
                    <h4 className="font-serif text-sm font-bold text-foreground">
                      Q: {faq.question}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      A: {faq.answer}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleEditFaq(faq)}
                      className="p-2 bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/30 text-muted-foreground hover:text-gold rounded-lg transition-colors cursor-pointer"
                      title="Edit FAQ"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq._id)}
                      className="p-2 bg-white/5 hover:bg-destructive/15 border border-white/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive-foreground rounded-lg transition-colors cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
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
