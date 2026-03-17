"use client";

import { useAuctionData } from "@/src/context/AuctionContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

export default function ProfileCard() {
  const { user, logout } = useAuctionData();

  const router = useRouter();
  const handleLogout = async () => {
    // Show confirmation toast with action buttons
    const logoutConfirm = toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800">Are you sure you want to logout?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performLogout();
            }}
            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Yes, Logout
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const performLogout = async () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "http://13.60.64.102:5000/api/v1/user/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        },
      );

      if (response.ok) {
        Cookies.remove("token");
        toast.success("Logged out successfully!");
        setTimeout(() => router.push("/login"), 500);
      } else {
        toast.error("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred while logging out");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full flex flex-col sm:flex-row items-center sm:items-start gap-5">
      <div className="relative w-20 h-20 shrink-0">
        <div className="w-20 h-20 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-3xl select-none">
  {user.username?.charAt(0).toUpperCase() ?? "?"}
</div>
      </div>
      <div className="flex flex-col items-center sm:items-start gap-1 flex-1">
        <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 px-5 py-2 bg-red-500 cursor-pointer hover:bg-red-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
