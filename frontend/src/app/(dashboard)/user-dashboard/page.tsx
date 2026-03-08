"use client";

import dynamic from "next/dynamic";
import ProfileCard from "./ProfileCard";
import BidsSkeleton from "./BidsSkeleton";
import { useAuctionData } from "@/src/context/AuctionContext";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BidsTabs = dynamic(() => import("./BidsTabs"), {
  loading: () => <BidsSkeleton />,
  ssr: false,
});

export default function DashboardPage() {
  const { isLoggedIn, loading } = useAuctionData();
  const router = useRouter();

  if (!isLoggedIn && !loading) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none p-0 w-fit"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-medium">Back</span>
        </button>

        <ProfileCard />

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Dashboard</h1>
          <BidsTabs />
        </div>
      </div>
    </main>
  );
}