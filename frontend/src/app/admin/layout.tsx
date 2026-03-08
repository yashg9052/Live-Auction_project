import { AuctionProvider } from "@/src/context/AuctionContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuctionProvider>
      <Header />
      {children}
      <Footer />
    </AuctionProvider>
  );
}