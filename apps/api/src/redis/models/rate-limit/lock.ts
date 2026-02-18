import type { Redis } from "@upstash/redis";

import type { RateLimitDetails } from "./schema";
import { LUA_ACQUIRE_SCRIPT } from "./script";
import type {
	AnyRateLimitLockKey,
	RateLimitAcquireResult,
	RateLimitAcquireScriptRes,
	RateLimitLockValue,
	RateLimitOptions,
} from "./types";

/**
 * @see {@link https://upstash.com/docs/redis/sdks/ratelimit-ts/overview}
 */
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

	async tryAcquire(): Promise<RateLimitAcquireResult> {
		const now = Date.now();

		const [allowed, remaining, resetAt]: RateLimitAcquireScriptRes =
			await this.#redis.eval(LUA_ACQUIRE_SCRIPT, [this.#key], [
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
		const pipeline = this.#redis
			.pipeline()
			.get<RateLimitLockValue>(this.#key)
			.pttl(this.#key);

		const [value, ttlMs] = await pipeline.exec();

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
