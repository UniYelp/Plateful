import { Lock } from "@upstash/lock";
import type { Redis } from "@upstash/redis";

import { DAY } from "@plateful/time";
import type { DeepDict } from "@plateful/types";
import { RedisKeys } from "./keys";
import { RateLimitLock } from "./models/rate-limit.lock";
import type { LockFactory } from "./types/locks";

export const RedisLocks = {
	recipes: {
		generate: {
			user: {
				index: (redis: Redis, userId: string) =>
					new Lock({
						id: RedisKeys.locks.recipes.generate.user.index(userId),
						lease: 1000 * 60,
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
