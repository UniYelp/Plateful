import type { Redis } from "@upstash/redis";
import { t } from "elysia";

import type { TypedRedisKey } from "../types/keys";

export type RateLimitLockValue = number;

export type AnyRateLimitLockKeyLike = TypedRedisKey<RateLimitLockValue>;

export type AnyRateLimitLockKey = Extract<AnyRateLimitLockKeyLike, string>;

type RateLimitAcquireScriptRes = [
	allowed: 0 | 1,
	remaining: number,
	resetAt: number,
];

type RateLimitOptions = {
	key: AnyRateLimitLockKey;
	/** Max allowed acquires per window */
	limit: number;
	/** Window duration in milliseconds */
	windowMs: number;
};

type AcquireResult = {
	acquired: boolean;
	remaining: number;
	resetAt: number;
};

export const RateLimitDetailsSchema = t.Object({
	remaining: t.Number(),
	resetAt: t.Nullable(t.Number()),
});

export type RateLimitDetails = typeof RateLimitDetailsSchema.static;

const LUA_ACQUIRE = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local current = redis.call("GET", key)

if not current then
  redis.call("SET", key, 1, "PX", windowMs)
  return {1, limit - 1, now + windowMs}
end

current = tonumber(current)

if current >= limit then
  local ttl = redis.call("PTTL", key)
  return {0, 0, now + ttl}
end

current = redis.call("INCR", key)
local ttl = redis.call("PTTL", key)

return {1, limit - current, now + ttl}
`;

export class RateLimitLock {
	#redis: Redis;
	#key: AnyRateLimitLockKey;

	readonly limit: number;
	readonly windowMs: number;

	constructor(redis: Redis, options: RateLimitOptions) {
		this.#redis = redis;
		this.#key = options.key;
		this.limit = options.limit;
		this.windowMs = options.windowMs;
	}

	async tryAcquire(): Promise<AcquireResult> {
		const now = Date.now();

		const [allowed, remaining, resetAt]: RateLimitAcquireScriptRes =
			await this.#redis.eval(LUA_ACQUIRE, [this.#key], [
				this.limit.toString(),
				this.windowMs.toString(),
				now.toString(),
			] as const);

		return {
			acquired: allowed === 1,
			remaining,
			resetAt,
		};
	}

	#remaining(value: number | null) {
		if (value === null) return this.limit;
		return Math.max(0, this.limit - value);
	}

	#resetAt(ttlMs: number) {
		if (ttlMs < 0) return null;
		return Date.now() + ttlMs;
	}

	async remaining(): Promise<RateLimitLockValue> {
		const value = await this.#redis.get<RateLimitLockValue>(this.#key);
		const remaining = this.#remaining(value);
		return remaining;
	}

	async resetAt(): Promise<number | null> {
		const ttlMs = await this.#redis.pttl(this.#key);
		const resetAt = this.#resetAt(ttlMs);
		return resetAt;
	}

	async details(): Promise<RateLimitDetails> {
		const pipline = this.#redis
			.pipeline()
			.get<RateLimitLockValue>(this.#key)
			.pttl(this.#key);

		const [value, ttlMs] = await pipline.exec();

		const remaining = this.#remaining(value);
		const resetAt = this.#resetAt(ttlMs);

		return {
			remaining,
			resetAt,
		};
	}

	async reset(): Promise<void> {
		await this.#redis.del(this.#key);
	}
}
