export default function BidsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-6 border-b border-gray-200 mb-5 pb-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
            <div className="w-20 h-20 rounded-lg bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-200 rounded w-28" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}