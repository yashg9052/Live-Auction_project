"use client"

import { useAuctionData } from "@/src/context/AuctionContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/home" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact-us", href: "/contact-us" },
];

const mobileMenuLinks = [
  { label: "Profile", href: "/user-dashboard" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Header() {
  const { isLoggedIn, isAdmin, loading, user } = useAuctionData();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-200 bg-[#155dfc30] h-16">
      <div className="mx-auto flex max-w-7xl h-full items-center justify-between px-6">
        <Link href="/" className="flex items-center flex-shrink-0">
          <div className="relative h-16 w-40 overflow-hidden">
            <Image
              src="/logo.svg"
              alt="BidBase Logo"
              fill
              className="object-contain scale-180"
              priority
            />
          </div>
        </Link>

        {!isAdmin && (
          <nav className="hidden min-[750px]:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors duration-150 ${
                  pathname === link.href
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {!isAdmin && (
            <div className="min-[750px]:hidden relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {isLoggedIn && (
                    <>
                      {mobileMenuLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            pathname === link.href
                              ? "text-blue-600 font-semibold bg-blue-50"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}
                  {!isLoggedIn && (
                    <>
                      <Link
                        href="/how-it-works"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          pathname === "/how-it-works"
                            ? "text-blue-600 font-semibold bg-blue-50"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        How It Works
                      </Link>
                      <Link
                        href="/contact-us"
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          pathname === "/contact-us"
                            ? "text-blue-600 font-semibold bg-blue-50"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Contact Us
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {!isLoggedIn ? (
            <div className="gap-3 sm:gap-4 hidden min-[750px]:flex">
              <Link
                href="/login"
                className="bg-blue-200 rounded-full px-4 py-1.5 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-150"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-200 rounded-full px-4 py-1.5 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-150"
              >
                Register
              </Link>
            </div>
          ) : (
            <Link
              href="/user-dashboard"
              className="hidden min-[750px]:flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-150"
              title="Go to Dashboard"
            >
              <span className="text-blue-600 font-extrabold text-sm select-none">
                {user?.username?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}