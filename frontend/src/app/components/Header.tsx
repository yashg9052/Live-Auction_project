"use client"

import { useAuctionData } from "@/src/context/AuctionContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/home" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact-us", href: "/contact-us" },
];

export default function Header() {
  const {isLoggedIn, logout}=useAuctionData()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  return (
    <header className="w-full border-b border-gray-200 bg-white h-16">
      <div className="mx-auto flex max-w-7xl h-full items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 ">
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

        <nav className="hidden min-[750px]:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {isLoggedIn?<button
          onClick={handleLogout}
          className="bg-red-500 rounded-full px-4 py-1.5 text-sm text-white hover:bg-red-600 transition-colors duration-150"
        >
          Logout
        </button>:<div className="flex gap-3 sm:gap-4">
          <Link
            href="/login"
            className=" bg-blue-200 rounded-full  px-4 py-1.5 text-sm text-gray-700 hover:bg-blue-600 border-black hover:text-white  transition-colors duration-150"
          >
            Login
          </Link>
          <Link
            href="/register"
            className=" bg-blue-200 rounded-full  px-4 py-1.5 text-sm text-gray-700 hover:bg-blue-600 border-black hover:text-white  transition-colors duration-150"
          >
            Register
          </Link>
        </div>}
      </div>
    </header>
  );
}