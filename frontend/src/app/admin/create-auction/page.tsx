"use client";

import { useState, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Electronics",
  "Fashion & Apparel",
  "Jewellery & Watches",
  "Art & Collectibles",
  "Antiques & Furniture",
  "Vehicles",
  "Books & Manuscripts",
  "Sports & Memorabilia",
  "Musical Instruments",
  "Other",
];

interface AuctionFormData {
  title: string;
  details: string;
  startingPrice: string;
  category: string;
  endsAt: string;
  image: File | null;
}

export default function CreateAuctionPage() {
  const router = useRouter();
  const [form, setForm] = useState<AuctionFormData>({
    title: "",
    details: "",
    startingPrice: "",
    category: "",
    endsAt: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AuctionFormData | "image", string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please upload a valid image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be smaller than 5MB." }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    setForm((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AuctionFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Item title is required.";
    if (!form.details.trim()) newErrors.details = "Description is required.";
    if (!form.startingPrice || isNaN(Number(form.startingPrice)) || Number(form.startingPrice) < 0)
      newErrors.startingPrice = "Enter a valid starting price.";
    if (!form.category) newErrors.category = "Please select a category.";
    if (!form.endsAt) newErrors.endsAt = "Auction end date & time is required.";
    else if (new Date(form.endsAt) <= new Date()) newErrors.endsAt = "End time must be in the future.";
    if (!form.image) newErrors.image = "Please upload an image.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append("file", form.image as File);
      formData.append("title", form.title.trim());
      formData.append("details", form.details.trim());
      formData.append("startingPrice", form.startingPrice);
      formData.append("category", form.category);
      formData.append("endsAt", new Date(form.endsAt).toISOString());

      const res = await fetch("http://localhost:5002/api/v1/create-auction", {
        method: "POST",
        headers: { token: Cookies.get("token") ?? "" },
        body: formData,
      });

      const data: { message: string } = await res.json();

      if (!res.ok) {
        setSubmitError(data.message);
        return;
      }

      setForm({ title: "", details: "", startingPrice: "", category: "", endsAt: "", image: null });
      setImagePreview(null);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-[#f0f4ff]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        .sora { font-family: 'Sora', sans-serif; }
        .field-focus:focus { outline: none; border-color: #3b5bdb; box-shadow: 0 0 0 3px rgba(59,91,219,0.15); }
        .drop-zone { transition: border-color 0.2s, background 0.2s; }
        .btn-primary { transition: background 0.18s, transform 0.12s, box-shadow 0.18s; }
        .btn-primary:hover:not(:disabled) { background: #2f4ec9 !important; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(59,91,219,0.35); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="max-w-[900px] mx-auto px-4 pt-10 pb-16">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#3b5bdb] hover:text-[#2f4ec9] transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-semibold">Back</span>
          </button>
          <p className="sora text-[#3b5bdb] font-semibold text-[13px] tracking-widest uppercase mb-1.5">Create New</p>
          <h1 className="sora text-[clamp(28px,5vw,40px)] font-extrabold text-[#111827] m-0 tracking-tight leading-tight">
            Auction Listing
          </h1>
        </div>

        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-5 pb-3.5 border-b border-[#e8edf8]">Item Details</h2>

                <div className="mb-[18px]">
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Item Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="field-focus w-full px-3.5 py-2.5 rounded-[10px] text-sm text-[#111] bg-[#fafbff]"
                    style={{ border: `1.5px solid ${errors.title ? "#ef4444" : "#d1d5db"}` }}
                    placeholder="e.g. Vintage Rolex Submariner"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                  {errors.title && <p className="text-red-500 text-[12px] mt-1 mb-0">{errors.title}</p>}
                </div>

                <div className="mb-[18px]">
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe the item condition, history, and key details..."
                    value={form.details}
                    onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))}
                    rows={5}
                    className="field-focus w-full px-3.5 py-2.5 rounded-[10px] text-sm text-[#111] bg-[#fafbff] resize-y min-h-[110px]"
                    style={{ border: `1.5px solid ${errors.details ? "#ef4444" : "#d1d5db"}` }}
                  />
                  {errors.details && <p className="text-red-500 text-[12px] mt-1 mb-0">{errors.details}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="field-focus w-full px-3.5 py-2.5 rounded-[10px] text-sm bg-[#fafbff] appearance-none cursor-pointer"
                    style={{ border: `1.5px solid ${errors.category ? "#ef4444" : "#d1d5db"}`, color: form.category ? "#111" : "#9ca3af" }}
                  >
                    <option value="" disabled>Select a category...</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-[12px] mt-1 mb-0">{errors.category}</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-5 pb-3.5 border-b border-[#e8edf8]">
                  Item Image <span className="text-red-500">*</span>
                </h2>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#e2e8f0]">
                    <img src={imagePreview} alt="Preview" className="w-full h-[220px] object-cover block" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2.5 right-2.5 bg-black/60 text-white border-none rounded-full w-8 h-8 cursor-pointer text-base flex items-center justify-center font-bold"
                    >×</button>
                    <div className="px-3.5 py-2.5 bg-[#f8faff] border-t border-[#e8edf8]">
                      <p className="m-0 text-xs text-[#64748b] font-medium">
                        📎 {form.image?.name} ({((form.image?.size || 0) / 1024).toFixed(0)} KB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="drop-zone rounded-xl text-center cursor-pointer px-5 py-10"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? "#3b5bdb" : errors.image ? "#ef4444" : "#c7d2fe"}`,
                      background: isDragging ? "#eef2ff" : "#f8faff",
                    }}
                  >
                    <div className="text-4xl mb-2.5">🖼️</div>
                    <p className="font-semibold text-[#3b5bdb] text-[15px] m-0 mb-1">Click or drag & drop</p>
                    <p className="text-[#94a3b8] text-[13px] m-0">PNG, JPG, WEBP · Max 5MB</p>
                  </div>
                )}

                <input type="file" ref={fileInputRef} onChange={handleFileInput} accept="image/*" className="hidden" />
                {errors.image && <p className="text-red-500 text-[12px] mt-2 mb-0">{errors.image}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-5 pb-3.5 border-b border-[#e8edf8]">Pricing</h2>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Starting Price (₹) <span className="text-red-500">*</span>
                </label>
                <div
                  className="flex items-center rounded-[10px] overflow-hidden bg-[#fafbff]"
                  style={{ border: `1.5px solid ${errors.startingPrice ? "#ef4444" : "#d1d5db"}` }}
                >
                  <span className="px-3.5 py-2.5 bg-[#eef2ff] text-[#3b5bdb] font-bold text-base border-r border-[#d1d5db] shrink-0">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.startingPrice}
                    onChange={(e) => setForm((p) => ({ ...p, startingPrice: e.target.value }))}
                    className="field-focus flex-1 px-3.5 py-2.5 border-none text-[15px] text-[#111] bg-transparent font-semibold focus:outline-none"
                  />
                </div>
                {errors.startingPrice && <p className="text-red-500 text-[12px] mt-1 mb-0">{errors.startingPrice}</p>}
                <p className="text-[#94a3b8] text-[12px] mt-2 mb-0">Bidders can place bids above this amount.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-1.5 pb-3.5 border-b border-[#e8edf8]">Schedule</h2>
                <p className="text-[#64748b] text-[13px] mt-3.5 mb-4">Set when this auction closes.</p>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Auction Ends At <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  min={minDateTime}
                  value={form.endsAt}
                  onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                  className="field-focus w-full px-3.5 py-2.5 rounded-[10px] text-sm text-[#111] bg-[#fafbff]"
                  style={{ border: `1.5px solid ${errors.endsAt ? "#ef4444" : "#d1d5db"}` }}
                />
                {errors.endsAt && <p className="text-red-500 text-[12px] mt-1 mb-0">{errors.endsAt}</p>}

                {form.endsAt && !errors.endsAt && (
                  <div className="mt-3.5 bg-[#eef2ff] rounded-[10px] px-4 py-3 flex items-center gap-2.5">
                    <span className="text-xl">⏱️</span>
                    <div>
                      <p className="m-0 text-[12px] text-[#6366f1] font-semibold">Closes on</p>
                      <p className="m-0 text-sm text-[#3730a3] font-bold">
                        {new Date(form.endsAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(form.title || form.startingPrice) && (
                <div className="bg-gradient-to-br from-[#eef2ff] to-[#f0f7ff] rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-[22px] border border-[#c7d2fe]">
                  <p className="text-[11px] font-bold text-[#6366f1] uppercase tracking-widest mt-0 mb-2.5">Preview</p>
                  <p className="sora m-0 mb-1 font-bold text-base text-[#1e293b]">{form.title || "Item Title"}</p>
                  {form.startingPrice && (
                    <p className="m-0 text-xl font-extrabold text-[#3b5bdb]">₹{Number(form.startingPrice).toLocaleString("en-IN")}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary sora w-full px-8 py-4 rounded-[14px] text-base font-bold text-white border-none flex items-center justify-center gap-2.5 tracking-tight"
              style={{ background: isSubmitting ? "#93a8f4" : "#3b5bdb", cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner inline-block w-[18px] h-[18px] rounded-full border-[2.5px] border-white/40 border-t-white" />
                  Creating Auction...
                </>
              ) : <>Create Auction Listing</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}