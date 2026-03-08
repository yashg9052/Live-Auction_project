"use client"

import { useAuctionData } from "@/src/context/AuctionContext";
import Link from "next/link";

// const footerLinks = {
//   Company: [
//     { label: "About Us", href: "/about" },
//     { label: "Careers", href: "/careers" },
//     { label: "Press", href: "/press" },
//   ],
//   Support: [
//     { label: "Help Center", href: "/help" },
//     { label: "Contact Us", href: "/contact" },
//     { label: "FAQ", href: "/faq" },
//   ],
//   Legal: [
//     { label: "Privacy Policy", href: "/privacy" },
//     { label: "Terms of Service", href: "/terms" },
//     { label: "Cookie Policy", href: "/cookies" },
//   ],
// };

export default function Footer() {
  const {loading}=useAuctionData();
  return (
    <footer className="w-full border-t border-gray-200 bg-[#155dfc30]">
      <div className=" flex flex-col gap-10 min-[700px]:flex-row mx-auto max-w-7xl px-6 py-10  justify-evenly">
        <div className="flex flex-col gap-3 max-w-xs">
          <span className="text-xl font-bold text-gray-900">BidBase</span>
          <p className="text-sm text-gray-500 leading-relaxed">
            The smarter way to discover and bid on what matters to you.
          </p>
        </div>

        <div > 
          <b>A project by - Yash Gupta</b>
        </div>
        <div>
          <ul className="flex gap-5">
            <li>LinkedIn</li>
            <li>GitHub</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
