export function getKeyName(...args: string[]) {
  return `BidBase:${args.join(":")}` ;
}

export const getUserKeyName = (id: string) => {
  return getKeyName(id);
};

export const getAuctionKeyName = (id: string) => {
  return getKeyName("auction", id);
};

// Hash key for auction list
export const getAuctionListKey = () => {
  return getKeyName("auction", "list");
};

// Hash key for auction details
export const getAuctionDetailKey = () => {
  return getKeyName("auction", "detail");
};