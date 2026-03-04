"use client";
import React, { useEffect, useRef, useState } from "react";
import type { IAuction } from "@/src/context/AuctionContext";
import { useAuctionData } from "@/src/context/AuctionContext";
import AuctionCard from "./AuctionCard";
import Loading from "./Loading";
import Error from "./Error";

interface Category {
  label: string;
  value: string;
}

interface StatusFilter {
  label: string;
  value: string;
}

const HomeMainContent = () => {
  const { auctions, loading, error, fetchAuctions } = useAuctionData();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("ACTIVE");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const CATEGORIES: Category[] = [
    { label: "All", value: "all" },
    { label: "Watches", value: "watches" },
    { label: "Tech", value: "tech" },
    { label: "Home", value: "home" },
    { label: "Collectibles", value: "collectibles" },
    { label: "Art", value: "art" },
  ];

  const STATUS_FILTERS: StatusFilter[] = [
    
    { label: "Active", value: "ACTIVE" },
    { label: "Ending Soon", value: "ENDING_SOON" },
    { label: "Ended", value: "ENDED" },
  ];

  function isEndingSoon(endingAt: string): boolean {
    const diff = new Date(endingAt).getTime() - Date.now();
    return diff > 0 && diff <= 10 * 60 * 1000;
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeCategoryLabel =
    CATEGORIES.find((c) => c.value === activeCategory)?.label ?? "All";

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchAuctions} />;

  const filteredAuctions = auctions?.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      activeCategory === "all"
        ? true
        : a.category?.toLowerCase() === activeCategory.toLowerCase();

    const matchStatus =
      activeStatus === "ALL"
        ? true
        : activeStatus === "ENDING_SOON"
          ? a.auction_status === "ACTIVE" && isEndingSoon(a.ending_at)
          : a.auction_status === activeStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      {/* Filters */}
      <div className="py-8 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-5 items-end">
        {/* Search */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Search
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-4 pr-11 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
            <svg
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M15 15l-3-3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Categories Dropdown */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Categories
          </p>
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setCategoryOpen((o) => !o)}
              className={`h-11 pl-4 pr-3 min-w-40 flex items-center justify-between gap-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                activeCategory !== "all"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              <span>{activeCategoryLabel}</span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {categoryOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 z-20 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setActiveCategory(c.value);
                      setCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 flex items-center justify-between ${
                      activeCategory === c.value
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {c.label}
                    {activeCategory === c.value && (
                      <svg
                        className="w-3.5 h-3.5 text-blue-600 flex-shrink-0"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 7l4 4 6-6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Status
          </p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => setActiveStatus(s.value)}
                className={`h-11 px-4 rounded-lg border text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                  activeStatus === s.value
                    ? s.value === "ENDING_SOON"
                      ? "bg-orange-500 border-orange-500 text-white font-semibold"
                      : s.value === "ENDED"
                        ? "bg-red-500 border-red-500 text-white font-semibold"
                        : "bg-gray-900 border-gray-900 text-white font-semibold"
                    : s.value === "ENDING_SOON"
                      ? "bg-white border-orange-200 text-orange-600 hover:border-orange-400"
                      : s.value === "ENDED"
                        ? "bg-white border-red-200 text-red-500 hover:border-red-400"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                {s.value === "ENDING_SOON" ? "⏰ " + s.label : s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auction Grid */}
      <section id="auctions" className="pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {activeStatus === "ENDING_SOON"
              ? "⏰ Ending Soon"
              : activeStatus === "ALL"
                ? "All Auctions"
                : STATUS_FILTERS.find((s) => s.value === activeStatus)?.label +
                  " Auctions"}
          </h2>
          <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            {filteredAuctions?.length} items
          </span>
        </div>

        {filteredAuctions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <svg
              className="w-14 h-14 mb-4 opacity-40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <p className="text-lg font-medium text-gray-500">
              No auctions found
            </p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions?.map((auction) => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                title={auction.title}
                current_highest_bid={auction.current_highest_bid}
                images={auction.images}
                ends_at={auction.ending_at}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeMainContent;