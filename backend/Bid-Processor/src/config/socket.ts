import { Server, Socket } from "socket.io";
import http from "http";

import express from "express";

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap: Record<string, string> = {};
export const receiverSocketid = (receiverId: string): string | undefined => {
  return userSocketMap[receiverId];
};
io.on("connection", (socket: Socket) => {
  console.log("User Connected", socket.id);
  const userId = socket.handshake.query.id as string | undefined;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }
  socket.on("joined-auction", (auctionId) => {
    const room = `auction_${auctionId}`;
    socket.join(room);
    console.log(`${socket.id} joined room:auction_${auctionId}`);
  });
  socket.on("leaveAuction", (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`User ${userId} left auction_${auctionId}`);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} removed from online users `);
    }
  });
  socket.on("connect_error", (error) => {
    console.log("Socket connection error", error);
  });
});
