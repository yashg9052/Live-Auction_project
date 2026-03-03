export function getKeyName(...args: string[]) {
  return `bitly:${args.join(":")}`;
}

// export const getUserKeyName = (id: string) =>
//   getKeyName("user", id);

// export const getAuctionListKeyName = () =>
//   getKeyName("auctions", "list");

// export const getAuctionDetailKeyName = (id: string) =>
//   getKeyName("auction", id);