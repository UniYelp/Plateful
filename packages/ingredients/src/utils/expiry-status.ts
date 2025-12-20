export const expiryStatus = ["expired", "expiring", "warning", "good"] as const;

export type ExpiryStatus = (typeof expiryStatus)[number];

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const DAYS_IN_WEEK = 7;
export const WEEK = DAY * DAYS_IN_WEEK


export const isExpired = (timeDiff: number) => timeDiff <= 0;
export const isExpiringSoon = (timeDiff: number) => timeDiff > 0 && timeDiff < DAY * 3;
export const isExpirationWarning = (timeDiff: number) =>
  timeDiff >= DAY * 3 && timeDiff < WEEK;
export const isGood = (timeDiff: number) => timeDiff >= WEEK

export const getExpiryStatusByDiffTime = (diffTime: number): ExpiryStatus => {
  if (isGood(diffTime)) return "good"
  if (isExpirationWarning(diffTime)) return "warning";
  if (isExpiringSoon(diffTime)) return "expiring";
  return "expired";
};

export const getExpiryStatusDetailsFromExpiryDate = (
  expiryDate: number,
): {
  status: (typeof expiryStatus)[number];
  text: string;
} => {
  const today = Date.now();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / DAY);

  const status = getExpiryStatusByDiffTime(diffTime);

  return {
    status,
    text: status === "expired" ? "expired" : `${diffDays} days`,
  };
};
