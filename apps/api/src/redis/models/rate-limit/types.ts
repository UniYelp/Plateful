import type { TypedRedisKey } from "../../types/keys";

export type RateLimitLockValue = number;

export type AnyRateLimitLockKeyLike = TypedRedisKey<RateLimitLockValue>;

export type AnyRateLimitLockKey = Extract<AnyRateLimitLockKeyLike, string>;

export type RateLimitAcquireScriptRes = [
	allowed: 0 | 1,
	remaining: number,
	resetAt: number,
];

export type RateLimitOptions = {
	key: AnyRateLimitLockKey;
	/** Max allowed acquires per window */
	limit: number;
	/** Window duration in milliseconds */
	windowMs: number;
};

export type RateLimitAcquireResult = {
	acquired: boolean;
	remaining: number;
	resetAt: number;
};
