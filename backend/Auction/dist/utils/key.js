export function getKeyName(...args) {
    return `BidBase:${args.join(":")}`;
}
// Hash key for auction list
export const getAuctionListKey = () => {
    return getKeyName("auction", "list");
};
// Hash key for auction details
export const getAuctionDetailKey = () => {
    return getKeyName("auction", "detail");
};
// export const getUserKeyName = (id: string) =>
//   getKeyName("user", id);
// export const getAuctionListKeyName = () =>
//   getKeyName("auctions", "list");
// export const getAuctionDetailKeyName = (id: string) =>
//   getKeyName("auction", id);
//# sourceMappingURL=key.js.map