"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useAuctionData } from "@/src/context/AuctionContext";
import Cookies from "js-cookie";
import { Clock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { UseSocketData } from "@/src/context/SocketContext";

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  approved_at: string;
  auction_id: number;
  user_id: string;
  username: string;
}

interface AuctionDetail {
  id: number;
  title: string;
  details: string;
  starting_price: number;
  current_highest_bid: number;
  current_highest_bidder_id: string;
  current_highest_bid_time: string;
  images: string[];
  category: string;
  auction_status: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
  bids: Bid[];
}
export interface UpdateAuction {
  current_highest_bid: number;
  current_highest_bidder_id: number;
  current_highest_bid_time: string;
  current_highest_bidder_username: string;
  approved_at: string | null;
  bids: Bid[];
}
function useCountdown(endsAt: string) {
  const calc = () => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, ended: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return time;
}

async function fetchAuctionDetail(id: string | number): Promise<AuctionDetail> {
  const res = await fetch(`http://localhost:5003/api/v1/auction/${id}`);
  const data: { message: string; auction: AuctionDetail } = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.auction;
}

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isLoggedIn, user } = useAuctionData();
  const { socket } = UseSocketData();
  const { id } = React.use(params);
  const router = useRouter();

  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [highestBid, setHighestBid] = useState<number | null>(
    auction?.current_highest_bid ?? null,
  );
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [bidValue, setBidValue] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [bidMsg, setBidMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAuctionDetail(id);
        setBids(data.bids ?? []);
        setAuction(data);
        setBidValue(data.current_highest_bid + 500);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);
useEffect(() => {
  if (!socket || !auction?.id) return;
  socket.emit("joined-auction", auction.id);

  const handler = (newBid: Bid) => {   // ← remove destructuring
    setBids((prev) => [newBid, ...prev]);
    setHighestBid(newBid.amount);
  };

  socket.on("new-highest-bid", handler);
  return () => {
    socket.off("new-highest-bid", handler);
    socket.emit("leaveAuction", auction.id);
  };
}, [socket, auction?.id]);

  const { days, hours, minutes, seconds, ended } = useCountdown(
    auction?.ends_at ?? "",
  );

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const shortId = (uid: string) => "User " + uid.slice(-6).toUpperCase();

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  const handlePlaceBid = useCallback(async () => {
    if (!auction || cooldown || user?.role === "admin") return;

    if (user?.banned) {
      setBidMsg({ type: "error", text: "You have been banned from bidding." });
      return;
    }

    const minBid = auction.current_highest_bid + 1;
    if (bidValue < minBid) {
      setBidMsg({
        type: "error",
        text: `Bid must be at least ${formatINR(minBid)}`,
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5004/api/v1/bid/make", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: Cookies.get("token") ?? "",
        },
        body: JSON.stringify({ auctionId: id, amount: bidValue }),
      });

      const data: { message: string } = await res.json();

      if (!res.ok) {
        setBidMsg({
          type: "error",
          text: data.message ?? "Failed to place bid. Try again.",
        });
        return;
      }

      setCooldown(true);
      setBidMsg({ type: "success", text: "Bid placed successfully!" });
      setAuction((prev) =>
        prev ? { ...prev, current_highest_bid: bidValue } : prev,
      );
      setBidValue(bidValue + 500);

      cooldownRef.current = setTimeout(() => {
        setCooldown(false);
        setBidMsg(null);
      }, 2000);
    } catch {
      setBidMsg({ type: "error", text: "Failed to place bid. Try again." });
    }
  }, [auction, bidValue, cooldown, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading auction...
          </p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold mb-2">
            Failed to load auction
          </p>
          <p className="text-sm text-gray-400 mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const minBid = auction.current_highest_bid + 1;
  const isEndingSoon =
    !ended &&
    new Date(auction.ends_at).getTime() - Date.now() <= 10 * 60 * 1000;
  const countdownColor = ended
    ? "text-gray-400"
    : isEndingSoon
      ? "text-red-500"
      : "text-blue-600";
  const countdownLabel = ended
    ? "Auction Ended"
    : days > 0
      ? `${days}d ${hours}h ${minutes}m ${seconds}s`
      : `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;

  const sortedBids = [...bids]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 15);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors mb-4 sm:mb-6 cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-medium">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 lg:hidden">
          {auction.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 sm:gap-8">
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <Image
                src={auction.images[activeImg] ?? "/placeholder.jpg"}
                alt={auction.title}
                fill
                className="object-cover"
                priority
              />
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow flex items-center gap-1.5 ${ended ? "bg-gray-200 text-gray-600" : isEndingSoon ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"}`}
              >
                {ended ? (
                  <span>Ended</span>
                ) : isEndingSoon ? (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>Ending Soon</span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Live</span>
                  </>
                )}
              </span>
            </div>

            {auction.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {auction.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all duration-150 ${activeImg === i ? "border-blue-500 shadow-md" : "border-transparent hover:border-gray-300"}`}
                  >
                    <Image
                      src={img}
                      alt={`thumb-${i}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Item Details
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {auction.details}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Category
                  </p>
                  <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                    {auction.category}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Starting Price
                  </p>
                  <p className="font-semibold text-gray-800">
                    {formatINR(auction.starting_price)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900">
                {auction.title}
              </h1>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                    Highest Bid
                  </p>
                  <p className="text-3xl font-bold text-red-500">
                    {formatINR(
                      highestBid ? highestBid : auction?.current_highest_bid,
                    )}
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <svg
                  className={`w-4 h-4 flex-shrink-0 ${countdownColor}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" />
                </svg>
                <span className="text-sm text-gray-500">Ends in:</span>
                <span className={`text-sm font-bold ${countdownColor}`}>
                  {countdownLabel}
                </span>
              </div>
            </div>

            {!ended && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-bold text-gray-800 mb-4">
                  Bidding Console
                </p>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={bidValue}
                    onChange={(e) => setBidValue(Number(e.target.value))}
                    min={minBid}
                    className="w-full h-12 pl-8 pr-4 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Minimum bid:{" "}
                  <span className="font-semibold text-gray-600">
                    {formatINR(minBid)}
                  </span>
                </p>
                {bidMsg && (
                  <p
                    className={`text-xs mb-3 font-medium ${bidMsg.type === "success" ? "text-green-600" : "text-red-500"}`}
                  >
                    {bidMsg.text}
                  </p>
                )}
                <button
                  onClick={isLoggedIn ? handlePlaceBid : undefined}
                  disabled={cooldown || !isLoggedIn}
                  className={`w-full h-12 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-150 ${!isLoggedIn ? "bg-gray-100 text-gray-400 cursor-not-allowed" : cooldown ? "bg-blue-300 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-200"}`}
                >
                  {!isLoggedIn
                    ? "Please Login to place a Bid"
                    : cooldown
                      ? "Processing…"
                      : "Place Bid"}
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-sm font-bold text-gray-800">
                  Live Bid History Feed
                </p>
              </div>
              <div className="flex flex-col divide-y divide-gray-50">
                {sortedBids.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No bids yet. Be the first!
                  </p>
                )}
                {sortedBids.map((bid, i) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between py-3 ${i === 0 ? "bg-green-50 -mx-5 px-5 rounded-xl" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {bid.username
                          ? bid.username[0].toUpperCase()
                          : shortId(bid.user_id).slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {bid.username ? bid.username : shortId(bid.user_id)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {timeAgo(bid.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${i === 0 ? "text-green-600" : "text-gray-700"}`}
                      >
                        {formatINR(bid.amount)}
                      </p>
                      {i === 0 && (
                        <p className="text-xs text-green-500 font-medium">
                          Highest
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Item Details
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {auction.details}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Category
                  </p>
                  <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                    {auction.category}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Starting Price
                  </p>
                  <p className="font-semibold text-gray-800">
                    {formatINR(auction.starting_price)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
