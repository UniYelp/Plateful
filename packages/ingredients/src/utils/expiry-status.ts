import { DAY } from "@plateful/time";
import {
	EXPIRATION_WARNING_TIME_WINDOW_MS,
	EXPIRING_SOON_TIME_WINDOW_MS,
} from "../constants";

export const expiryStatus = ["expired", "expiring", "warning", "good"] as const;
export type ExpiryStatus = (typeof expiryStatus)[number];

export type ExpiryDetails = {
	status: ExpiryStatus;
	text: string;
};

export const isExpired = (timeDiff: number) => timeDiff <= 0;
export const isExpiringSoon = (timeDiff: number) =>
	timeDiff > 0 && timeDiff < EXPIRING_SOON_TIME_WINDOW_MS;
export const isExpirationWarning = (timeDiff: number) =>
	timeDiff >= EXPIRING_SOON_TIME_WINDOW_MS &&
	timeDiff < EXPIRATION_WARNING_TIME_WINDOW_MS;
export const isGood = (timeDiff: number) =>
	timeDiff >= EXPIRATION_WARNING_TIME_WINDOW_MS;

export const getExpiryStatusByDiffTime = (diffTime: number): ExpiryStatus => {
	if (isGood(diffTime)) return "good";
	if (isExpirationWarning(diffTime)) return "warning";
	if (isExpiringSoon(diffTime)) return "expiring";
	return "expired";
};

export const getExpiryDetailsFromExpiryDate = (
	expiryDate: number,
): ExpiryDetails => {
	const today = Date.now();
	const diffTime = expiryDate - today;
	const diffDays = Math.ceil(diffTime / DAY);

	const status = getExpiryStatusByDiffTime(diffTime);

	return {
		status,
		text: status === "expired" ? "Expired" : `${diffDays} days`,
	};
};

export const getExpiryDetailsFromExpiryDates = (
	expiryDates: number[],
): ExpiryDetails | null => {
	if (!expiryDates.length) return null;

	const soonestExpiry = Math.min(...expiryDates);
	const expiryDetails = getExpiryDetailsFromExpiryDate(soonestExpiry);

	return expiryDetails;
};
