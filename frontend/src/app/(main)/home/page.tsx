"use client";

import { Suspense } from "react";
import Hero from "../../components/Hero";
import HomeMainContent from "../../components/HomeMainContent";
import Loading from "../../components/Loading";

const Home = () => {
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
