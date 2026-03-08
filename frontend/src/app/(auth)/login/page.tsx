"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useAuctionData } from "@/src/context/AuctionContext";
import Cookies from "js-cookie";

export interface IUser {
  _id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginResponse {
  message: "Logged in successfully";
  user?: IUser;
  token?: string;
}

const LoginPage = () => {
  const router = useRouter();

  const { isLoggedIn, setIsLoggedIn } = useAuctionData();

  React.useEffect(() => {
    if (isLoggedIn) router.replace("/home");
  }, [isLoggedIn]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const LOGIN_SERVER = "http://localhost:5000";

      const response = await fetch(`${LOGIN_SERVER}/api/v1/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: ILoginResponse = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      const token = data.token;

      if (token) {
        Cookies.set("token", token, { expires: 7 });
      }

      setIsLoggedIn(true);
      router.replace("/home");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md px-6 sm:px-8 py-8 sm:py-10">
      {/* Logo */}
      {/* Logo with back arrow */}
      <div className="flex items-center justify-center mb-6 relative">
        <button
          onClick={() => router.back()}
          className="absolute  left-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 cursor-pointer" />
        </button>
        <div className="relative h-12 w-36 ">
          <Image
            src="/logo.svg"
            alt="BidBase Logo"
            fill
            className="object-contain scale-190 "
            priority
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Login</h1>
        <p className="text-sm text-gray-500 mt-1">
          Access your account to Bid. Win. Own.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          <p className="text-xs text-red-500 font-medium">{error}</p>
        </div>
      )}

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Enter Email"
          className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      {/* Password */}
      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Link
            href="/forgot-password"
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            className="w-full h-11 px-4 pr-11 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                  strokeLinecap="round"
                />
                <path
                  d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                  strokeLinecap="round"
                />
                <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full h-11 mt-5 rounded-lg text-sm font-semibold transition-all duration-150 ${
          loading
            ? "bg-blue-300 text-white cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-200"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="white"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Logging in...
          </span>
        ) : (
          "Log In"
        )}
      </button>

      {/* Register */}
      <p className="text-center text-sm text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-blue-500 font-medium hover:text-blue-700 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
