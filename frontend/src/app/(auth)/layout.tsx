import { AuctionProvider } from "@/src/context/AuctionContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuctionProvider>
      <div className="fixed inset-0 bg-[#eef2f7] flex items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-sm my-8">{children}</div>
      </div>
    </AuctionProvider>
  );
}
