import type { Lock } from "@upstash/lock";
import type { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";

import type { FN } from "@plateful/types";

export type RedisLock = Lock | Ratelimit;

export type LockFactory<Args extends any[] = any[]> = FN<
	RedisLock,
	[redis: Redis, ...Args]
>;
