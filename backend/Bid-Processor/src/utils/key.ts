export function getKeyName(...args: string[]) {
  return `BidBase:${args.join(":")}` ;
}

// Hash key for highest bids across all auctions
export const getHighestBidKey = () => {
  return getKeyName("bid", "highest");
};

// Hash field for a specific auction's highest bid
export const getAuctionBidField = (auctionId: string | number) => {
  return auctionId.toString();
};
