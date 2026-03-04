import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center gap-6">

        {/* Circle Loading Animation */}
        <div className="relative w-20 h-20">
          <svg
            className="w-20 h-20 animate-spin"
            viewBox="0 0 50 50"
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="90 150"
              strokeDashoffset="0"
            />
          </svg>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 text-lg font-medium">
          Loading auctions...
        </p>

        {/* Dots animation */}
        <div className="flex gap-1">
          <span
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></span>
          <span
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>

      </div>
    </div>
  );
};

export default Loading;