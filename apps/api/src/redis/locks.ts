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
			household: {
				lock: (redis: Redis, householdId: string) =>
					new Lock({
						id: RedisKeys.recipes.gen.household.lock(householdId),
						lease: 5 * MINUTE,
						redis,
					}),
				rph: (redis: Redis, householdId: string) =>
					new RateLimitLock(redis, {
						key: RedisKeys.recipes.gen.household.rph(householdId),
						limit: 5,
						windowMs: DAY,
					}),
			},
		},
	},
} satisfies DeepDict<LockFactory>;
