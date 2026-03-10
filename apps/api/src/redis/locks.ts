import { Lock } from "@upstash/lock";
import { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";

import { MINUTE } from "@plateful/time";
import type { DeepDict } from "@plateful/types";
import { RedisKeys } from "./keys";
import type { LockFactory } from "./types/locks";

export const RedisLocks = {
	recipes: {
		gen: {
			household: {
				lock: (redis: Redis, householdId: string) =>
					new Lock({
						redis,
						id: RedisKeys.recipes.gen.household.lock(householdId),
						lease: 5 * MINUTE,
					}),
				rph: (redis: Redis) =>
					new Ratelimit({
						redis,
						limiter: Ratelimit.slidingWindow(5, "1d"),
					}),
			},
		},
	},
} satisfies DeepDict<LockFactory>;
