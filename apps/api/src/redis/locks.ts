import { Lock } from "@upstash/lock";
import type { Redis } from "@upstash/redis";

import type { DeepDict, FN } from "@plateful/types";
import { RedisKeys } from "./keys";

export type LockFactory<Args extends any[] = any[]> = [redis: Redis, ...Args];

// TODO: QuotaLock
export const RedisLocks = {
	recipes: {
		generate: {
			user: (redis: Redis, userId: string) =>
				new Lock({
					id: RedisKeys.locks.recipes.generate.user(userId),
					lease: 1000 * 60,
					redis,
				}),
		},
	},
} satisfies DeepDict<FN<Lock, LockFactory>>;
