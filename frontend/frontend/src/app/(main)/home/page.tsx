"use client";

import { Suspense } from "react";
import Hero from "../../components/Hero";
import HomeMainContent from "../../components/HomeMainContent";
import Loading from "../../components/Loading";
import { useAuctionData } from "@/src/context/AuctionContext";
import { redirect } from "next/navigation";

const Home = () => {
  const {isAdmin,loading}=useAuctionData()
  
  if(isAdmin&&!loading){
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-gray-50 min-w-screen">
      {/* Hero  */}
      <Hero />

      {/* Main Content  */}
      <Suspense fallback={<Loading />}>
        <HomeMainContent />
      </Suspense>
    </div>
  );
};

export default Home;
