"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useAuctionData } from "@/src/context/AuctionContext";

export interface IUser {
  _id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVerifyUserResponse {
  message: string;
  user: IUser;
  token: string;
}

export default function VerifyUser() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuctionData();
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/v1/user/verify-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data: IVerifyUserResponse = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      Cookies.set("token", data.token, { expires: 7 });
      setIsLoggedIn(true);
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const resendOtp = async () => {
    setError("");
    setTimer(60);
    setCanResend(false);

    try {
      const res = await fetch("http://localhost:5000/api/v1/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: { message: string } = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }
    } catch {
      setError("Failed to resend OTP. Please try again.");
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
          <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-500 mt-2">Enter the OTP sent to {email}</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="text-sm text-gray-600">OTP Code</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6 digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 cursor-pointer text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Verify
          </button>
        </form>

        <div className="text-center mt-5">
          {!canResend ? (
            <p className="text-sm text-gray-500">
              Resend OTP in <span className="font-semibold">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={resendOtp}
              className="text-blue-600 font-medium hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}