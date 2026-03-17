"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuctionData } from "./AuctionContext";

interface ISocketContext {
  socket: Socket | null;
}
interface ProviderProps {
  children: ReactNode;
}
const SocketContext = createContext<ISocketContext>({
  socket: null,
});

export const SocketProvider = ({ children }: ProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuctionData();
  const Bid_Processor_Service = "http://13.60.64.102:5005";
  useEffect(() => {
    if (!user?._id) return;
    const newSocket = io(Bid_Processor_Service, {
      query: {
        userId: user._id,
      },
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);
  return (
    <SocketContext.Provider value={{ socket: socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const UseSocketData = () => useContext(SocketContext);