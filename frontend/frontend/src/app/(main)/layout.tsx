import { AuctionProvider } from "@/src/context/AuctionContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SocketProvider } from "@/src/context/SocketContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuctionProvider>
      <SocketProvider>
        <Header />
        {children}
        <Footer />
      </SocketProvider>
    </AuctionProvider>
  );
}
