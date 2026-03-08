"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

export default function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    gsap.fromTo(
      stepsRef.current,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.25,
        ease: "power3.out",
      }
    );
  }, []);

  const steps = [
    {
      title: "Browse Live Auctions",
      desc: "Explore a wide range of live auctions and discover unique items available for bidding. Each auction shows the current highest bid and remaining time.",
    },
    {
      title: "Place Your Bid",
      desc: "Enter a bid higher than the current highest bid. Our system instantly validates and securely processes your bid.",
    },
    {
      title: "Real-Time Updates",
      desc: "All bids are processed in real time, and the highest bid is instantly updated for everyone viewing the auction.",
    },
    {
      title: "Compete With Other Bidders",
      desc: "Multiple users can bid simultaneously, but our system ensures bids are handled fairly and in the correct order.",
    },
    {
      title: "Auction Ends",
      desc: "When the timer reaches zero, the highest bidder wins the item and receives a confirmation notification.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center px-6 py-20">

      {/* Title */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          How <span className="text-blue-600">BidBase</span> Works
        </h1>

        <p className="text-gray-600 text-lg">
          Follow these simple steps to participate in auctions and compete with
          bidders from around the world.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-16 grid md:grid-cols-2 gap-10 max-w-5xl w-full">

        {steps.map((step, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) stepsRef.current[i] = el;
            }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition"
          >
            <div className="text-blue-600 text-3xl font-bold mb-4">
              {i + 1}
            </div>

            <h3 className="text-xl font-semibold mb-3">
              {step.title}
            </h3>

            <p className="text-gray-600 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="mt-16 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition"
      >
        Back to Home
      </Link>
    </div>
  );
}