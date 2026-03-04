"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";

export interface IAuction {
  id: number;
  title: string;
  current_highest_bid: number;
  images: string[];
  ending_at: string;
  category?:string;
  auction_status:"ACTIVE" | "ENDED" | "CANCELLED"
}

export interface Idata {
  message: string;
  auctions: IAuction[];
}

interface AuctionContextType {
  auctions: IAuction[] | null;
  setAuctions: React.Dispatch<React.SetStateAction<IAuction[] | null>>;
  loading: boolean;
  error: string | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  fetchAuctions: () => Promise<void>;
  isLoggedIn:boolean;
  setIsLoggedIn:React.Dispatch<React.SetStateAction<boolean>>;
  logout:() => void;
}
interface AuctionContextProviderProps {
  children: ReactNode;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<AuctionContextProviderProps> = ({
  children,
}) => {
  const server = "http://localhost:5003";
  const [auctions, setAuctions] = useState<IAuction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const[isLoggedIn,setIsLoggedIn]=useState(false)

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<Idata>(`${server}/api/v1/all`);
      setAuctions(data.auctions);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      setError("Failed to load auctions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
  };
  useEffect(() => {
    // Check if token exists in cookies on mount
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
    }
    fetchAuctions();
  }, []);
  return (
    <AuctionContext.Provider
      value={{
        auctions,
        setAuctions,
        loading,
        error,
        setLoading,
        setError,
        fetchAuctions,
        isLoggedIn,
        setIsLoggedIn,
        logout,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuctionData = (): AuctionContextType => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuctionData must be used within AppProvider");
  }
  return context;
};
