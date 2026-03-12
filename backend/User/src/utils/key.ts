export const getKeyName = (...args: string[]): string => {
  return `BidBase:${args.join(":")}`;
};

  


export const getUserKeyName = (id: string) => {
  return getKeyName(id);
};

export const getAuctionKeyName = (id: string) => {
  return getKeyName("auction", id);
};

// Hash key for OTP data
export const getOtpDataKey = () => {
  return getKeyName("otp", "data");
};

// Hash key for OTP rate limiting
export const getOtpRateLimitKey = () => {
  return getKeyName("otp", "ratelimit");
};

// Hash key for user list
export const getUserListKey = () => {
  return "Users:list";
}
