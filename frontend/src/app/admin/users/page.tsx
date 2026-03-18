"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { IUser } from "@/src/context/AuctionContext";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


const user_server = "http://13.60.64.102:5000";
const SERVER=user_server
const admin_server="http://13.60.64.102:5002"


export default function AllUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [banLoading, setBanLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER}/api/v1/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: Cookies.get("token") || "",
        },
      });

      const data: { message: string; Users?: IUser[]; users?: IUser[] } =
        await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setUsers(data.Users ?? data.users ?? []);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId: string) => {
  setBanLoading(userId);
  try {
    const res = await fetch("http://13.60.64.102:5002/api/v1/change-ban-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: Cookies.get("token") || "",
      },
      body: JSON.stringify({ userId }),
    });

    const data: {
      message: string;
      userId: string;
      banned: boolean;
    } = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, banned: data.banned } : u,
      ),
    );
  } catch {
    setError("Something went wrong.");
  } finally {
    setBanLoading(null);
  }
};

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen bg-[#f0f4ff]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
        .user-row { transition: background 0.15s; }
        .user-row:hover { background: #f5f7ff; }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-4 py-10 pb-16">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#3b5bdb] hover:text-[#2f4ec9] transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-semibold">Back</span>
          </button>
          <p className="text-[#3b5bdb] font-semibold text-xs tracking-widest uppercase m-0 mb-1.5">
            Admin · Users
          </p>
          <h1
            className="font-extrabold text-gray-900 m-0 leading-tight"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(26px, 5vw, 38px)",
              letterSpacing: "-1px",
            }}
          >
            All Users
          </h1>
          <p className="text-slate-500 text-sm mt-2 mb-0">
            {users.length} registered user{users.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <div className="mb-6 relative max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 shadow-sm transition-all"
          />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={fetchUsers}
              className="ml-auto text-xs font-semibold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <span className="spin inline-block w-6 h-6 border-2 border-slate-200 border-t-[#3b5bdb] rounded-full" />
            <span className="text-sm font-medium">Loading users...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm font-medium">
              No users found{search ? " for your search" : ""}.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8faff] border-b border-[#e8edf8]">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user._id}
                      className="user-row border-b border-[#f0f4ff] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#eef2ff] flex items-center justify-center text-sm font-bold text-[#3b5bdb] shrink-0 overflow-hidden">
                            {user.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-sm text-slate-800">
                            {user.username || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-600"}`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.banned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${user.banned ? "bg-red-500" : "bg-green-500"}`}
                          />
                          {user.banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => toggleBan(user._id)}
                          disabled={banLoading === user._id}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-60 ${user.banned ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"}`}
                        >
                          {banLoading === user._id ? (
                            <span className="spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                          ) : user.banned ? (
                            "Unban"
                          ) : (
                            "Ban"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 md:hidden">
              {filtered.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(59,91,219,0.07)] p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center text-sm font-bold text-[#3b5bdb] shrink-0 overflow-hidden">
                        {user.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="m-0 font-semibold text-sm text-slate-800">
                          {user.username || "—"}
                        </p>
                        <p className="m-0 text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${user.banned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${user.banned ? "bg-red-500" : "bg-green-500"}`}
                      />
                      {user.banned ? "Banned" : "Active"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-4">
                    <span>
                      <span className="font-semibold text-slate-500">
                        Role:{" "}
                      </span>
                      <span
                        className={`font-semibold ${user.role === "admin" ? "text-purple-600" : "text-blue-600"}`}
                      >
                        {user.role || "user"}
                      </span>
                    </span>
                    <span>
                      <span className="font-semibold text-slate-500">
                        Joined:{" "}
                      </span>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBan(user._id)}
                    disabled={banLoading === user._id}
                    className={`w-full py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-60 ${user.banned ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"}`}
                  >
                    {banLoading === user._id ? (
                      <span className="spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                    ) : user.banned ? (
                      "✓ Unban User"
                    ) : (
                      "⛔ Ban User"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
