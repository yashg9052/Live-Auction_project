export interface IAuction {
    id: number;
    title: string;
    current_highest_bid: number;
    images: string[];
    ending_at: string;
    auction_status: "ACTIVE" | "ENDED" | "CANCELLED";
    category: string;
    ends_at: string;
}
export interface Ibid {
    id: string;
    amount: number;
    created_at: string;
    approved_at: string;
    auction_id: number;
    user_id: string;
}
export interface IAuctiondetail {
    id: number;
    title: string;
    details: string;
    starting_price: number;
    current_highest_bid: number | null;
    current_highest_bidder_username: string | null;
    current_highest_bidder_id: string | null;
    current_highest_bid_time: Date | null;
    images: string[] | null;
    category: string;
    auction_status: "ACTIVE" | "ENDED" | "CANCELLED";
    ends_at: string;
    created_at: string;
    updated_at: string;
    bids: Ibid[] | null;
}
export declare const getAllAuctions: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getSingleAuctionDetail: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getActiveBids: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getWonItems: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=Auction.d.ts.map