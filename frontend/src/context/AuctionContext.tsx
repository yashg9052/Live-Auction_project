"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export interface IAuction {
  id: number;
  title: string;
  current_highest_bid: number;
  images: string[];
  ending_at: string;
  category?: string;
  auction_status: "ACTIVE" | "ENDED" | "CANCELLED";
  ends_at: string;
}
export interface Idata {
  message: string;
  auctions: IAuction[];
}
export interface IUser {
  _id: string;
  email: string;
  username: string;
  role: string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface IProfileResponse {
  message: string;
  user: IUser;
}

export interface ICategory {
  label: string;
  value: string;
}

interface AuctionContextType {
  auctions: IAuction[] | null;
  setAuctions: React.Dispatch<React.SetStateAction<IAuction[] | null>>;
  loading: boolean;
  error: string | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  fetchAuctions: () => Promise<void>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  categories: ICategory[];
}

interface AuctionContextProviderProps {
  children: ReactNode;
}
<<<<<<< HEAD
=======
const auction_server = "http://13.60.64.102:5003";
export const server=auction_server;
>>>>>>> e8c10dd (Final Commit)

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<AuctionContextProviderProps> = ({
  children,
}) => {
  const server = "http://localhost:5003";
  const router = useRouter();

  const [user, setUser] = useState<IUser | null>(null);
  const [auctions, setAuctions] = useState<IAuction[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([
    { label: "All", value: "all" },
  ]);

  const fetchUser = async (token: string) => {
<<<<<<< HEAD
    const user_server = "http://localhost:5000";
=======
    const user_server = "http://13.60.64.102:5000";
>>>>>>> e8c10dd (Final Commit)
    try {
      const res = await fetch(`${user_server}/api/v1/user/profile`, {
        headers: { token },
      });
      const data: IProfileResponse = await res.json();
      if (!res.ok) return;
      if (data.user.role === "admin") setIsAdmin(true);
      setUser(data.user);
    } catch {
      console.error("Error fetching user profile");
    }
  };

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${server}/api/v1/all`);
      const data: Idata = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setAuctions(data.auctions);

      const unique = Array.from(
        new Set(
          data.auctions.map((a) => a.category).filter(Boolean) as string[],
        ),
      );

      const converted: ICategory[] = [
        { label: "All", value: "all" },
        ...unique.map((cat) => ({
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: cat.toLowerCase(),
        })),
      ];
      setCategories(converted);
    } catch {
      setError("Failed to load auctions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("token");
    if (isAdmin) setIsAdmin(false);
    setIsLoggedIn(false);
    router.push("/home");
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUser(token.toString());
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
        user,
        setUser,
        isAdmin,
        setIsAdmin,
        categories,
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