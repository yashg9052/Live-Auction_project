import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

interface AuctionCardProps {
  id: number;
  title: string;
  current_highest_bid: number;
  images: string[];
  ends_at: string;
  countdownLabel?: string;
  isEndingSoon?: boolean;
}

function getTimeLeft(endsAt: string): string {
  const diffMs = new Date(endsAt).getTime() - Date.now();
  if (diffMs <= 0) return "Ended";
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export default function AuctionCard({
  id,
  title,
  current_highest_bid,
  images,
  ends_at,
  countdownLabel,
  isEndingSoon = false,
}: AuctionCardProps) {
  // Use passed-in label if available, otherwise compute locally
  const timeLeft = countdownLabel ?? getTimeLeft(ends_at);
  const ended = timeLeft === "Ended";

  return (
    <Link href={`/auctions/${id}`} className="w-full">
      <div className="w-full rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">

        {/* Image */}
        <div className="relative w-full h-44 bg-gray-100">
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover"
          />
          {/* Ending soon badge */}
          {isEndingSoon && !ended && (
            <span className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
              <Clock className="w-3 h-3" />
              Ending Soon
            </span>
          )}
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
            <Clock className={`w-3.5 h-3.5 ${ended ? "text-gray-300" : isEndingSoon ? "text-orange-400" : "text-gray-400"}`} />
            <span className="text-xs text-gray-500">
              {ended ? (
                <span className="font-medium text-gray-400">Auction Ended</span>
              ) : (
                <>
                  Ends in:{" "}
                  <span className={`font-medium ${isEndingSoon ? "text-orange-600" : "text-red-700"}`}>
                    {timeLeft}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}