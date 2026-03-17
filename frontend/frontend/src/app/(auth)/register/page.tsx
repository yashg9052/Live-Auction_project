"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuctionData } from "@/src/context/AuctionContext";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";

export interface IUser {
  _id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRegisterResponse {
  message: string;
  user: IUser;
  token: string;
}

type Step = "email" | "otp" | "details";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuctionData();

  React.useEffect(() => {
    if (isLoggedIn) router.replace("/home");
  }, [isLoggedIn]);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // otp timer
  React.useEffect(() => {
    if (step !== "otp") return;
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, step]);

  // Step 1 — Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://13.60.64.102:5000/api/v1/user/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data: { message: string } = await res.json();
      console.log(data)
      if (!res.ok) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      setStep("otp");
      setTimer(60);
      setCanResend(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError(null);
    setTimer(60);
    setCanResend(false);
    try {
      const res = await fetch("http://13.60.64.102:5000/api/v1/user/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data: { message: string } = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to resend OTP.");
      }
    } catch {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://13.60.64.102:5000/api/v1/user/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data: { message: string } = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid or expired OTP.");
        return;
      }
      setStep("details");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Register
  const handleRegister = async () => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://13.60.64.102:5000/api/v1/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: username, password }),
      });
      const data: IRegisterResponse = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }
      if (data.token) Cookies.set("token", data.token, { expires: 7 });
      setIsLoggedIn(true);
      router.replace("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, { title: string; subtitle: string }> = {
    email: { title: "Create Account", subtitle: "Join Bidly to Bid. Win. Own." },
    otp: { title: "Verify Email", subtitle: `Enter the OTP sent to ${email}` },
    details: { title: "Almost There!", subtitle: "Set your username and password" },
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md px-6 sm:px-8 py-8 sm:py-10">
      
      <div className="flex items-center justify-center mb-6 relative">
        <button
          onClick={() => {
            if (step === "email") router.back();
            else if (step === "otp") setStep("email");
            else if (step === "details") setStep("otp");
          }}
          className="absolute left-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 cursor-pointer" />
        </button>
        <div className="relative h-12 w-36">
          <Image
            src="/logo.svg"
            alt="BidBase Logo"
            fill
            className="object-contain scale-190"
            priority
          />
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(["email", "otp", "details"] as Step[]).map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                step === s
                  ? "bg-blue-600 scale-125"
                  : (["email", "otp", "details"] as Step[]).indexOf(step) > i
                    ? "bg-blue-300"
                    : "bg-gray-200"
              }`}
            />
            {i < 2 && <div className={`w-8 h-px ${(["email", "otp", "details"] as Step[]).indexOf(step) > i ? "bg-blue-300" : "bg-gray-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {stepTitles[step].title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{stepTitles[step].subtitle}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          <p className="text-xs text-red-500 font-medium">{error}</p>
        </div>
      )}

      {/* Step 1 — Email */}
      {step === "email" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              placeholder="Enter your email"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className={`w-full h-11 mt-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              loading
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-200"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending OTP...
              </span>
            ) : (
              "Send OTP"
            )}
          </button>
        </>
      )}

      {/* Step 2 — OTP */}
      {step === "otp" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              placeholder="Enter 6-digit OTP"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-center tracking-widest"
            />
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className={`w-full h-11 mt-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              loading
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-200"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>

          <div className="text-center mt-4">
            {!canResend ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-semibold text-blue-600">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      {/* Step 3 — Details */}
      {step === "details" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="Enter username"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-11 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" strokeLinecap="round" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" strokeLinecap="round" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full h-11 mt-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              loading
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-200"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </>
      )}

      {/* Login link */}
      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 font-medium hover:text-blue-700 transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}