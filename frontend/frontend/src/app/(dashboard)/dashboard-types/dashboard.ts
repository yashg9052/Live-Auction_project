export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface BidItem {
  id: string;
  title: string;
  imageUrl: string;
  yourBid: number;
  status: "winning" | "outbid" | "won";
}