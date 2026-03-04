

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

interface AuctionCardProps {
  id: number;
  title: string;
  current_highest_bid: number;
  images: string[];
  ends_at: string;
}

function getTimeLeft(endsAt: string): string {
  const now = new Date();
  const end = new Date(endsAt);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return "Ended";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AuctionCard({
  id,
  title,
  current_highest_bid,
  images,
  ends_at,
}: AuctionCardProps) {
  const timeLeft = getTimeLeft(ends_at);

  return (
    <Link href={`/auctions/${id}`}>
      <div className="w-52 rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">

        {/* Image */}
        <div className="relative w-full h-44 bg-gray-100">
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div className="px-3 py-3 flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {title}
          </h3>

          <p className="text-xs text-gray-500">Highest Bid</p>

          <p className="text-lg font-bold text-gray-900">
            ₹{current_highest_bid.toLocaleString("en-IN")}
          </p>

          {/* Timer */}
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">
              Ends in: <span className="font-medium text-gray-700">{timeLeft}</span>
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}