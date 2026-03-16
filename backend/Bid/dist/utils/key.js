export function getKeyName(...args) {
    return `BidBase:${args.join(":")}`;
}
// Hash key for bid rate limiting by user
export const getBidRateLimitUserKey = () => {
    return getKeyName("bid", "ratelimit", "user");
};
// Hash key for bid rate limiting by IP
export const getBidRateLimitIpKey = () => {
    return getKeyName("bid", "ratelimit", "ip");
};
//# sourceMappingURL=key.js.map