"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AlertCircle, X, ArrowLeft } from "lucide-react";

const SERVER = "http://localhost:5003";

interface IAuction {
  id: number;
  title: string;
  current_highest_bid: number;
  images: string[] | null;
  auction_status: "ACTIVE" | "ENDED" | "CANCELLED" | "PAUSED" | "DELETED";
  ends_at: string;
}

interface AuctionsResponse {
  message: string;
  auctions: IAuction[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    ACTIVE: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    ENDED: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
    PAUSED: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
    DELETED: { bg: "bg-zinc-100", text: "text-zinc-400", dot: "bg-zinc-300" },
  };

export default function AllAuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<IAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER}/api/v1/all`, {
        headers: { token: Cookies.get("token") || "" },
      });

      const data: AuctionsResponse = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setAuctions(data.auctions ?? []);
    } catch {
      setError("Failed to load auctions. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(
        `http://localhost:5002/api/v1/delete-auction/${id}`,
        {
          method: "DELETE",
          headers: { token: Cookies.get("token") || "" },
        },
      );

      const data: { message: string } = await res.json();

      if (!res.ok) {
        setDeleteError(data.message);
        return;
      }

      setAuctions((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setDeleteError("Failed to delete auction.");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const visibleAuctions = auctions.filter(
    (a) => a.auction_status !== "DELETED",
  );

  return (
    <div
      className="min-h-screen bg-[#f0f4ff]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        .sora { font-family: 'Sora', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
        .auction-row { transition: background 0.15s; }
        .auction-row:hover { background: #f8faff; }
        .btn-update { transition: background 0.15s, transform 0.12s; }
        .btn-update:hover { background: #2f4ec9 !important; transform: translateY(-1px); }
        .btn-delete { transition: background 0.15s, transform 0.12s; }
        .btn-delete:hover { background: #dc2626 !important; transform: translateY(-1px); }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#3b5bdb] hover:text-[#2f4ec9] transition-colors cursor-pointer bg-transparent border-none p-0 mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-semibold">Back</span>
        </button>
        <div className="flex items-start justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <p className="sora text-[#3b5bdb] font-semibold text-[11px] sm:text-[13px] tracking-widest uppercase mb-1">
              Admin
            </p>
            <h1 className="sora text-[clamp(22px,5vw,38px)] font-extrabold text-[#111827] m-0 tracking-tight leading-tight">
              All Auctions
            </h1>
            <p className="text-[#64748b] text-xs sm:text-sm mt-1 mb-0">
              {visibleAuctions.length} auction
              {visibleAuctions.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/create-auction")}
            className="sora flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white border-none cursor-pointer"
            style={{ background: "#3b5bdb" }}
          >
            + New Auction
          </button>
        </div>

        {deleteError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              className="ml-auto text-xs font-semibold underline cursor-pointer bg-transparent border-none"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <span className="spinner inline-block w-6 h-6 rounded-full border-[3px] border-[#3b5bdb]/20 border-t-[#3b5bdb]" />
            <span className="text-[#64748b] font-medium text-sm">
              Loading auctions...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex items-start sm:items-center gap-3 flex-wrap">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-500" />
            <div className="flex-1 min-w-0">
              <p className="sora font-bold text-red-700 m-0 text-sm">
                Connection Error
              </p>
              <p className="text-red-500 text-xs mt-0.5 mb-0 break-words">
                {error}
              </p>
            </div>
            <button
              onClick={fetchAuctions}
              className="text-xs font-semibold text-[#3b5bdb] underline cursor-pointer bg-transparent border-none shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && visibleAuctions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] px-6 sm:px-8 py-12 sm:py-16 text-center">
            <div className="text-4xl sm:text-5xl mb-4">📭</div>
            <p className="sora font-bold text-[#1e293b] text-base sm:text-lg mb-1">
              No auctions yet
            </p>
            <p className="text-[#94a3b8] text-sm">
              Create your first auction to get started.
            </p>
          </div>
        )}

        {!loading && !error && visibleAuctions.length > 0 && (
          <>
            {/* ════ DESKTOP TABLE (lg+) ════ */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] overflow-hidden">
              <div className="grid grid-cols-[56px_1fr_140px_160px_160px_180px] items-center px-5 py-3 border-b border-[#e8edf8] bg-[#f8faff]">
                {[
                  "IMG",
                  "Title",
                  "Status",
                  "Highest Bid",
                  "Ends At",
                  "Actions",
                ].map((h, i) => (
                  <span
                    key={h}
                    className={`text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {visibleAuctions.map((auction, idx) => {
                const style =
                  STATUS_STYLES[auction.auction_status] ?? STATUS_STYLES.ENDED;
                const isDeleting = deletingId === auction.id;
                const isConfirming = confirmDelete === auction.id;
                return (
                  <div
                    key={auction.id}
                    className={`auction-row grid grid-cols-[56px_1fr_140px_160px_160px_180px] items-center px-5 py-3.5 ${idx !== visibleAuctions.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f0f4ff] shrink-0">
                      {auction.images?.[0] ? (
                        <img
                          src={auction.images[0]}
                          alt={auction.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          🖼️
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 pr-4">
                      <p className="sora font-bold text-[#1e293b] text-sm m-0 truncate">
                        {auction.title}
                      </p>
                      <p className="text-[#94a3b8] text-xs m-0 mt-0.5">
                        ID: {auction.id}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${style.bg} ${style.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                        />
                        {auction.auction_status}
                      </span>
                    </div>
                    <p className="sora font-bold text-[#3b5bdb] text-sm m-0">
                      {auction.current_highest_bid ? (
                        `₹${Number(auction.current_highest_bid).toLocaleString("en-IN")}`
                      ) : (
                        <span className="text-[#94a3b8] font-medium">
                          No bids
                        </span>
                      )}
                    </p>
                    <p className="text-[#64748b] text-xs m-0 font-medium">
                      {new Date(auction.ends_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      {isConfirming ? (
                        <>
                          <span className="text-[11px] text-red-500 font-semibold mr-1">
                            Sure?
                          </span>
                          <button
                            onClick={() => handleDelete(auction.id)}
                            disabled={isDeleting}
                            className="btn-delete px-3 py-1.5 rounded-lg text-[11px] font-bold text-white border-none cursor-pointer flex items-center gap-1"
                            style={{ background: "#ef4444" }}
                          >
                            {isDeleting ? (
                              <span className="spinner inline-block w-3 h-3 rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                              "Yes, delete"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#64748b] border border-[#e2e8f0] bg-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/admin/update-auction/${auction.id}`)
                            }
                            className="btn-update px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white border-none cursor-pointer"
                            style={{ background: "#3b5bdb" }}
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setConfirmDelete(auction.id)}
                            className="btn-delete px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white border-none cursor-pointer"
                            style={{ background: "#ef4444" }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ════ TABLET TABLE (md–lg) ════ */}
            <div className="hidden md:block lg:hidden bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] overflow-hidden">
              <div className="grid grid-cols-[44px_1fr_110px_120px_150px] items-center px-4 py-3 border-b border-[#e8edf8] bg-[#f8faff]">
                {["IMG", "Title", "Status", "Bid", "Actions"].map((h, i) => (
                  <span
                    key={h}
                    className={`text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {visibleAuctions.map((auction, idx) => {
                const style =
                  STATUS_STYLES[auction.auction_status] ?? STATUS_STYLES.ENDED;
                const isDeleting = deletingId === auction.id;
                const isConfirming = confirmDelete === auction.id;
                return (
                  <div
                    key={auction.id}
                    className={`auction-row grid grid-cols-[44px_1fr_110px_120px_150px] items-center px-4 py-3 ${idx !== visibleAuctions.length - 1 ? "border-b border-[#f1f5f9]" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#f0f4ff] shrink-0">
                      {auction.images?.[0] ? (
                        <img
                          src={auction.images[0]}
                          alt={auction.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">
                          🖼️
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="sora font-bold text-[#1e293b] text-xs m-0 truncate">
                        {auction.title}
                      </p>
                      <p className="text-[#94a3b8] text-[10px] m-0 mt-0.5">
                        ID: {auction.id} ·{" "}
                        {new Date(auction.ends_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                        />
                        {auction.auction_status}
                      </span>
                    </div>
                    <p className="sora font-bold text-[#3b5bdb] text-xs m-0">
                      {auction.current_highest_bid ? (
                        `₹${Number(auction.current_highest_bid).toLocaleString("en-IN")}`
                      ) : (
                        <span className="text-[#94a3b8] font-medium text-[10px]">
                          No bids
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 justify-end">
                      {isConfirming ? (
                        <>
                          <button
                            onClick={() => handleDelete(auction.id)}
                            disabled={isDeleting}
                            className="btn-delete px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white border-none cursor-pointer"
                            style={{ background: "#ef4444" }}
                          >
                            {isDeleting ? (
                              <span className="spinner inline-block w-2.5 h-2.5 rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                              "Confirm"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#64748b] border border-[#e2e8f0] bg-white cursor-pointer"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/admin/update-auction/${auction.id}`)
                            }
                            className="btn-update px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white border-none cursor-pointer"
                            style={{ background: "#3b5bdb" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(auction.id)}
                            className="btn-delete px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white border-none cursor-pointer"
                            style={{ background: "#ef4444" }}
                          >
                            Del
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ════ MOBILE CARDS (< md) ════ */}
            <div className="flex flex-col gap-3 md:hidden">
              {visibleAuctions.map((auction) => {
                const style =
                  STATUS_STYLES[auction.auction_status] ?? STATUS_STYLES.ENDED;
                const isDeleting = deletingId === auction.id;
                const isConfirming = confirmDelete === auction.id;
                return (
                  <div
                    key={auction.id}
                    className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f0f4ff] shrink-0">
                        {auction.images?.[0] ? (
                          <img
                            src={auction.images[0]}
                            alt={auction.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🖼️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="sora font-bold text-[#1e293b] text-sm m-0 truncate">
                          {auction.title}
                        </p>
                        <p className="text-[#94a3b8] text-[11px] m-0 mt-0.5">
                          ID: {auction.id}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                          />
                          {auction.auction_status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#f8faff] mb-3">
                      <div>
                        <p className="text-[10px] text-[#94a3b8] font-semibold uppercase tracking-wide m-0">
                          Highest Bid
                        </p>
                        <p className="sora font-bold text-[#3b5bdb] text-sm m-0 mt-0.5">
                          {auction.current_highest_bid ? (
                            `₹${Number(auction.current_highest_bid).toLocaleString("en-IN")}`
                          ) : (
                            <span className="text-[#94a3b8] font-medium text-xs">
                              No bids
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[#94a3b8] font-semibold uppercase tracking-wide m-0">
                          Ends At
                        </p>
                        <p className="text-[#64748b] text-xs font-medium m-0 mt-0.5">
                          {new Date(auction.ends_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500 font-semibold flex-1">
                          Delete this auction?
                        </span>
                        <button
                          onClick={() => handleDelete(auction.id)}
                          disabled={isDeleting}
                          className="btn-delete flex-1 py-2 rounded-xl text-xs font-bold text-white border-none cursor-pointer flex items-center justify-center gap-1"
                          style={{ background: "#ef4444" }}
                        >
                          {isDeleting ? (
                            <span className="spinner inline-block w-3 h-3 rounded-full border-2 border-white/40 border-t-white" />
                          ) : (
                            "Yes, delete"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-[#64748b] border border-[#e2e8f0] bg-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/update-auction/${auction.id}`)
                          }
                          className="btn-update flex-1 py-2 rounded-xl text-xs font-bold text-white border-none cursor-pointer"
                          style={{ background: "#3b5bdb" }}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setConfirmDelete(auction.id)}
                          className="btn-delete flex-1 py-2 rounded-xl text-xs font-bold text-white border-none cursor-pointer"
                          style={{ background: "#ef4444" }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
