"use client";

import { useState, useEffect } from "react";
import { BidItem } from "../dashboard-types/dashboard";
import Image from "next/image";
import Cookies from "js-cookie";

const STATUS_STYLES: Record<BidItem["status"], string> = {
  winning: "bg-green-500 text-white",
  outbid: "bg-red-500 text-white",
  won: "bg-blue-500 text-white",
};
<<<<<<< HEAD
=======
const auction_server = "http://13.60.64.102:5003";
>>>>>>> e8c10dd (Final Commit)

function BidCard({ item }: { item: BidItem }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Your Bid: ${item.yourBid.toLocaleString()}
        </p>
      </div>
      <span className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize ${STATUS_STYLES[item.status]}`}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </span>
    </div>
  );
}
function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl animate-pulse">
          <div className="w-20 h-20 rounded-lg bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-200 rounded w-28" />
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}


// API Functions
const getActiveBidsFromAPI = async (): Promise<BidItem[]> => {
  try {
    const token = Cookies.get("token");
    const auction_server = "http://localhost:5003";
    const response = await fetch(`${auction_server}/api/v1/active-bids`, {
      method: "GET",
      headers: {
        token: token || "",          // ✅ matches req.headers.token
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error(`Failed to fetch active bids: ${response.statusText}`);
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching active bids:", error);
    return [];
  }
};

const getWonItemsFromAPI = async (): Promise<BidItem[]> => {
  try {
    const token = Cookies.get("token");
    const auction_server = "http://localhost:5003"; 
    const response = await fetch(`${auction_server}/api/v1/won-items`, {
      method: "GET",
      headers: {
        token: token || "",         
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error(`Failed to fetch won items: ${response.statusText}`);
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching won items:", error);
    return [];
  }
};

export default function BidsTabs() {
  const [activeTab, setActiveTab] = useState<"active" | "won">("active");
  const [activeBids, setActiveBids] = useState<BidItem[]>([]);
  const [wonItems, setWonItems] = useState<BidItem[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingWon, setLoadingWon] = useState(false);
  const [wonFetched, setWonFetched] = useState(false);

  
  useEffect(() => {
    setLoadingActive(true);
    getActiveBidsFromAPI()
      .then(setActiveBids)
      .finally(() => setLoadingActive(false));
  }, []);

  
  useEffect(() => {
    if (activeTab === "won" && !wonFetched) {
      setLoadingWon(true);
      getWonItemsFromAPI()
        .then(setWonItems)
        .finally(() => {
          setLoadingWon(false);
          setWonFetched(true);
        });
    }
  }, [activeTab, wonFetched]);

  const isLoading = activeTab === "active" ? loadingActive : loadingWon;
  const items = activeTab === "active" ? activeBids : wonItems;

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {(["active", "won"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "active" ? "Active Bids" : "Won Items"}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">
          {activeTab === "active" ? "No active bids." : "No won items yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <BidCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}