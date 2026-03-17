"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AlertCircle, ArrowLeft } from "lucide-react";
const AUCTION_SERVER = "http://13.60.64.102:5003";
const SERVER=AUCTION_SERVER;
const admin_server="http://13.60.64.102:5002"
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

const STATUSES = ["ACTIVE","CANCELLED", "PAUSED"];

interface AuctionFormData {
  title: string;
  details: string;
  startingPrice: string;
  category: string;
  auction_status: string;
  image: File | null;
}

export interface Ibid {
  id: string;
  amount: number;
  created_at: string;
  approved_at: string;
  auction_id: number;
  user_id: string;
}

export interface IAuctiondetail {
  id: number;
  title: string;
  details: string;
  starting_price: number;
  current_highest_bid: number;
  images: string[] | null;
  category: string;
  auction_status: "ACTIVE" | "ENDED" | "CANCELLED" | "PAUSED";
  ends_at: string;
  created_at: string;
  updated_at: string;
  bids: Ibid[] | null;
}

export default function UpdateAuctionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<AuctionFormData>({
    title: "",
    details: "",
    startingPrice: "",
    category: "",
    auction_status: "",
    image: null,
  });
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEndingNow, setIsEndingNow] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [auctionEndsAt, setAuctionEndsAt] = useState<string>("");
  const [auctionStatus, setAuctionStatus] = useState<string>("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof AuctionFormData, string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAuction = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`${SERVER}/api/v1/auction/${id}`, {
          headers: { token: Cookies.get("token") || "" },
        });

        const data: { message: string; auction: IAuctiondetail } =
          await res.json();

        if (!res.ok) {
          setFetchError(data.message);
          return;
        }

        const a = data.auction;
        setForm({
          title: a.title ?? "",
          details: a.details ?? "",
          startingPrice: a.starting_price?.toString() ?? "",
          category: a.category ?? "",
          auction_status: a.auction_status ?? "",
          image: null,
        });
        setAuctionEndsAt(a.ends_at ?? "");
        setAuctionStatus(a.auction_status ?? "");
        if (a.images?.[0]) setExistingImageUrl(a.images[0]);
      } catch {
        setFetchError("Failed to load auction details.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchAuction();
  }, [id]);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload a valid image file.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image must be smaller than 5MB.",
      }));
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

  const removeNewImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AuctionFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Item title is required.";
    if (!form.details.trim()) newErrors.details = "Description is required.";
    if (
      !form.startingPrice ||
      isNaN(Number(form.startingPrice)) ||
      Number(form.startingPrice) < 0
    )
      newErrors.startingPrice = "Enter a valid starting price.";
    if (!form.category) newErrors.category = "Please select a category.";
    if (!form.auction_status)
      newErrors.auction_status = "Please select a status.";
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
      formData.append("title", form.title.trim());
      formData.append("details", form.details.trim());
      formData.append("startingPrice", form.startingPrice);
      formData.append("category", form.category);
      formData.append("auction_status", form.auction_status);
      formData.append("endNow", "false");
      if (form.image) formData.append("file", form.image);

      const res = await fetch(
        `${admin_server}/api/v1/update-auction/${id}`,
        {
          method: "PATCH",
          headers: { token: Cookies.get("token") ?? "" },
          body: formData,
        },
      );

      const data: { message: string } = await res.json();
      if (!res.ok) {
        setSubmitError(data.message);
        return;
      }
      router.push("/admin/auctions");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndNow = async () => {
    setIsEndingNow(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("details", form.details.trim());
      formData.append("startingPrice", form.startingPrice);
      formData.append("category", form.category);
      formData.append("auction_status", "ENDED");
      formData.append("endNow", "true");

      const res = await fetch(
        `${admin_server}/api/v1/update-auction/${id}`,
        {
          method: "PATCH",
          headers: { token: Cookies.get("token") ?? "" },
          body: formData,
        },
      );

      const data: { message: string } = await res.json();
      if (!res.ok) {
        setSubmitError(data.message);
        return;
      }
      router.push("/admin/auctions");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsEndingNow(false);
    }
  };

  const inputBase =
    "field-focus w-full px-3.5 py-2.5 rounded-[10px] text-sm text-[#111] bg-[#fafbff]";

  const isAlreadyEnded =
    auctionStatus === "ENDED" || auctionStatus === "CANCELLED";

  if (isFetching) {
    return (
      <div
        className="min-h-screen bg-[#f0f4ff] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner { animation: spin 0.7s linear infinite; }
        `}</style>
        <span className="spinner inline-block w-8 h-8 rounded-full border-4 border-[#3b5bdb]/20 border-t-[#3b5bdb]" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div
        className="min-h-screen bg-[#f0f4ff] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');`}</style>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-[#ef4444] font-semibold">{fetchError}</p>
          <button
            onClick={() => router.back()}
            className="mt-3 text-[#3b5bdb] underline text-sm cursor-pointer bg-transparent border-none"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f0f4ff]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        .sora { font-family: 'Sora', sans-serif; }
        .field-focus:focus { outline: none; border-color: #3b5bdb; box-shadow: 0 0 0 3px rgba(59,91,219,0.15); }
        .drop-zone { transition: border-color 0.2s, background 0.2s; }
        .btn-primary { transition: background 0.18s, transform 0.12s, box-shadow 0.18s; }
        .btn-primary:hover:not(:disabled) { background: #2f4ec9 !important; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(59,91,219,0.35); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-danger { transition: background 0.18s, transform 0.12s, box-shadow 0.18s; }
        .btn-danger:hover:not(:disabled) { background: #b91c1c !important; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(239,68,68,0.35); }
        .btn-danger:active:not(:disabled) { transform: translateY(0); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="max-w-[900px] mx-auto px-4 pt-10 pb-16">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#3b5bdb] hover:text-[#2f4ec9] transition-colors cursor-pointer bg-transparent border-none p-0 mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-semibold">Back</span>
          </button>
          <p className="sora text-[#3b5bdb] font-semibold text-[13px] tracking-widest uppercase mb-1.5">
            Edit Auction #{id}
          </p>
          <h1 className="sora text-[clamp(28px,5vw,40px)] font-extrabold text-[#111827] m-0 tracking-tight leading-tight">
            Update Listing
          </h1>
        </div>

        {auctionEndsAt && (
          <div className="mb-6 bg-[#eef2ff] border border-[#c7d2fe] rounded-xl px-4 py-3 flex items-center gap-2.5">
            <span className="text-lg">⏱️</span>
            <div>
              <p className="m-0 text-[12px] text-[#6366f1] font-semibold">
                Scheduled to close on
              </p>
              <p className="m-0 text-sm text-[#3730a3] font-bold">
                {new Date(auctionEndsAt).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-5 pb-3.5 border-b border-[#e8edf8]">
                  Item Details
                </h2>

                <div className="mb-[18px]">
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Item Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputBase}
                    style={{
                      border: `1.5px solid ${errors.title ? "#ef4444" : "#d1d5db"}`,
                    }}
                    placeholder="e.g. Vintage Rolex Submariner"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                  {errors.title && (
                    <p className="text-red-500 text-[12px] mt-1 mb-0">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="mb-[18px]">
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe the item condition, history, and key details..."
                    value={form.details}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, details: e.target.value }))
                    }
                    rows={5}
                    className={`${inputBase} resize-y min-h-[110px]`}
                    style={{
                      border: `1.5px solid ${errors.details ? "#ef4444" : "#d1d5db"}`,
                    }}
                  />
                  {errors.details && (
                    <p className="text-red-500 text-[12px] mt-1 mb-0">
                      {errors.details}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value }))
                    }
                    className={`${inputBase} appearance-none cursor-pointer`}
                    style={{
                      border: `1.5px solid ${errors.category ? "#ef4444" : "#d1d5db"}`,
                      color: form.category ? "#111" : "#9ca3af",
                    }}
                  >
                    <option value="" disabled>
                      Select a category...
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-[12px] mt-1 mb-0">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-5 pb-3.5 border-b border-[#e8edf8]">
                  Item Image
                </h2>

                {existingImageUrl && !imagePreview && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-[#e2e8f0]">
                    <img
                      src={existingImageUrl}
                      alt="Current"
                      className="w-full h-[160px] object-cover block"
                    />
                    <div className="px-3.5 py-2 bg-[#f8faff] border-t border-[#e8edf8]">
                      <p className="m-0 text-xs text-[#64748b] font-medium">
                        Current image — upload a new one to replace
                      </p>
                    </div>
                  </div>
                )}

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#e2e8f0]">
                    <img
                      src={imagePreview}
                      alt="New Preview"
                      className="w-full h-[220px] object-cover block"
                    />
                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="absolute top-2.5 right-2.5 bg-black/60 text-white border-none rounded-full w-8 h-8 cursor-pointer text-base flex items-center justify-center font-bold"
                    >
                      ×
                    </button>
                    <div className="px-3.5 py-2.5 bg-[#f8faff] border-t border-[#e8edf8]">
                      <p className="m-0 text-xs text-[#64748b] font-medium">
                        📎 {form.image?.name} (
                        {((form.image?.size || 0) / 1024).toFixed(0)} KB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="drop-zone rounded-xl text-center cursor-pointer px-5 py-8"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? "#3b5bdb" : errors.image ? "#ef4444" : "#c7d2fe"}`,
                      background: isDragging ? "#eef2ff" : "#f8faff",
                    }}
                  >
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="font-semibold text-[#3b5bdb] text-[14px] m-0 mb-1">
                      {existingImageUrl
                        ? "Upload replacement image"
                        : "Click or drag & drop"}
                    </p>
                    <p className="text-[#94a3b8] text-[12px] m-0">
                      PNG, JPG, WEBP · Max 5MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="image/*"
                  className="hidden"
                />
                {errors.image && (
                  <p className="text-red-500 text-[12px] mt-2 mb-0">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-5 pb-3.5 border-b border-[#e8edf8]">
                  Pricing
                </h2>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Starting Price (₹) <span className="text-red-500">*</span>
                </label>
                <div
                  className="flex items-center rounded-[10px] overflow-hidden bg-[#fafbff]"
                  style={{
                    border: `1.5px solid ${errors.startingPrice ? "#ef4444" : "#d1d5db"}`,
                  }}
                >
                  <span className="px-3.5 py-2.5 bg-[#eef2ff] text-[#3b5bdb] font-bold text-base border-r border-[#d1d5db] shrink-0">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.startingPrice}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, startingPrice: e.target.value }))
                    }
                    className="field-focus flex-1 px-3.5 py-2.5 border-none text-[15px] text-[#111] bg-transparent font-semibold focus:outline-none"
                  />
                </div>
                {errors.startingPrice && (
                  <p className="text-red-500 text-[12px] mt-1 mb-0">
                    {errors.startingPrice}
                  </p>
                )}
                <p className="text-[#94a3b8] text-[12px] mt-2 mb-0">
                  Bidders can place bids above this amount.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-7">
                <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-5 pb-3.5 border-b border-[#e8edf8]">
                  Status
                </h2>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Auction Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.auction_status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, auction_status: e.target.value }))
                  }
                  className={`${inputBase} appearance-none cursor-pointer`}
                  style={{
                    border: `1.5px solid ${errors.auction_status ? "#ef4444" : "#d1d5db"}`,
                    color: form.auction_status ? "#111" : "#9ca3af",
                  }}
                >
                  <option value="" disabled>
                    Select status...
                  </option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.auction_status && (
                  <p className="text-red-500 text-[12px] mt-1 mb-0">
                    {errors.auction_status}
                  </p>
                )}
              </div>

              {!isAlreadyEnded && (
                <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(239,68,68,0.08)] p-7 border border-red-100">
                  <h2 className="sora text-[17px] font-bold text-[#1e293b] mt-0 mb-2 pb-3.5 border-b border-red-100">
                    Danger Zone
                  </h2>
                  <p className="text-[13px] text-[#64748b] mt-3 mb-4">
                    Immediately close this auction. This will trigger winner
                    resolution and cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={handleEndNow}
                    disabled={isEndingNow || isSubmitting}
                    className="btn-danger sora w-full px-6 py-3 rounded-[12px] text-sm font-bold text-white border-none flex items-center justify-center gap-2"
                    style={{
                      background: isEndingNow ? "#fca5a5" : "#ef4444",
                      cursor:
                        isEndingNow || isSubmitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {isEndingNow ? (
                      <>
                        <span className="spinner inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white" />
                        Ending Auction...
                      </>
                    ) : (
                      "End Auction Now"
                    )}
                  </button>
                </div>
              )}

              {(form.title || form.startingPrice) && (
                <div className="bg-gradient-to-br from-[#eef2ff] to-[#f0f7ff] rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-[22px] border border-[#c7d2fe]">
                  <p className="text-[11px] font-bold text-[#6366f1] uppercase tracking-widest mt-0 mb-2.5">
                    Preview
                  </p>
                  <p className="sora m-0 mb-1 font-bold text-base text-[#1e293b]">
                    {form.title || "Item Title"}
                  </p>
                  {form.startingPrice && (
                    <p className="m-0 text-xl font-extrabold text-[#3b5bdb]">
                      ₹{Number(form.startingPrice).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting || isEndingNow}
              className="btn-primary sora w-full px-8 py-4 rounded-[14px] text-base font-bold text-white border-none flex items-center justify-center gap-2.5 tracking-tight"
              style={{
                background: isSubmitting ? "#93a8f4" : "#3b5bdb",
                cursor: isSubmitting || isEndingNow ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner inline-block w-[18px] h-[18px] rounded-full border-[2.5px] border-white/40 border-t-white" />
                  Saving Changes...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
