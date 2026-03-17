"use client";

import { useRouter } from "next/navigation";

const actions = [
  {
    href: "/admin/create-auction",
    emoji: "🔨",
    label: "Create Auction",
    description: "List a new item for bidding",
    accent: "#3b5bdb",
    light: "#eef2ff",
  },
  {
    href: "/admin/users",
    emoji: "👥",
    label: "All Users",
    description: "View and manage registered users",
    accent: "#0891b2",
    light: "#e0f7fa",
  },
  {
    href: "/admin/auctions",
    emoji: "📋",
    label: "All Auctions",
    description: "Monitor live and past auctions",
    accent: "#7c3aed",
    light: "#f3e8ff",
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f0f4ff]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        .sora { font-family: 'Sora', sans-serif; }
        .dash-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 16px rgba(59,91,219,0.07);
          padding: 36px 28px;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .dash-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(59,91,219,0.13);
        }
        .dash-card:active { transform: translateY(-1px); }
        .dash-arrow {
          margin-left: auto;
          margin-top: auto;
          font-size: 20px;
          opacity: 0.3;
          transition: opacity 0.18s, transform 0.18s;
        }
        .dash-card:hover .dash-arrow { opacity: 1; transform: translateX(4px); }
      `}</style>

      <div className="max-w-[860px] mx-auto px-4 pt-12 pb-16">
        {/* Header */}
        <div className="mb-10">
          <p className="sora text-[#3b5bdb] font-semibold text-[13px] tracking-widest uppercase mb-1.5">
            Welcome back
          </p>
          <h1 className="sora text-[clamp(28px,5vw,42px)] font-extrabold text-[#111827] m-0 tracking-tight leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-[#64748b] text-[15px] mt-2.5 mb-0 font-normal">
            Manage your auction platform from one place.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {actions.map((action) => (
            <div
              key={action.href}
              className="dash-card"
              onClick={() => router.push(action.href)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = action.accent + "33")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
              {/* Icon */}
              <div
                className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px]"
                style={{ background: action.light }}
              >
                {action.emoji}
              </div>

              {/* Text */}
              <div>
                <p className="sora m-0 mb-1 font-bold text-[18px] text-[#1e293b] tracking-tight">
                  {action.label}
                </p>
                <p className="m-0 text-[13px] text-[#94a3b8] font-medium leading-snug">
                  {action.description}
                </p>
              </div>

              {/* Arrow */}
              <span className="dash-arrow" style={{ color: action.accent }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}