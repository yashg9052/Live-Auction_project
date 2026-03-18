"use client";

import { useAuctionData } from "@/src/context/AuctionContext";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPassword() {
  const router = useRouter();
  const { isLoggedIn } = useAuctionData();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (isLoggedIn) {
    router.push("/home");
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {

      const res = await fetch("http://13.60.64.102:5000/api/v1/user/forgot-password", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: { message: string } = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      router.push(`/verify-user/${encodeURIComponent(email)}`);
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-center mb-6 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 cursor-pointer" />
          </button>
          <div className="relative h-12 w-36">
            <Image
              src="/logo.svg"
              alt="BidBase Logo"
              fill
              className="object-contain scale-150"
              priority
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 cursor-pointer text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Send OTP
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Remember password?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}