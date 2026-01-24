import { Lock } from "@upstash/lock";
import type { Redis } from "@upstash/redis";

import { DAY, MINUTE } from "@plateful/time";
import type { DeepDict } from "@plateful/types";
import { RedisKeys } from "./keys";
import { RateLimitLock } from "./models/rate-limit";
import type { LockFactory } from "./types/locks";

export const RedisLocks = {
	recipes: {
		gen: {
			user: {
				index: (redis: Redis, userId: string) =>
					new Lock({
						id: RedisKeys.recipes.gen.user.index(userId),
						lease: 10 * MINUTE,
						redis,
					}),
				rpu: (redis: Redis, userId: string) =>
					new RateLimitLock(redis, {
						key: RedisKeys.recipes.gen.user.rpu(userId),
						limit: 5,
						windowMs: DAY,
					}),
			},
		},
		generate: {
			user: {
				index: (redis: Redis, userId: string) =>
					new Lock({
						id: RedisKeys.locks.recipes.generate.user.index(userId),
						lease: MINUTE,
						redis,
					}),
				rpu: (redis: Redis, userId: string) =>
					new RateLimitLock(redis, {
						key: RedisKeys.locks.recipes.generate.user.rpu(userId),
						limit: 5,
						windowMs: DAY,
					}),
			},
		},
	},
} satisfies DeepDict<LockFactory>;
