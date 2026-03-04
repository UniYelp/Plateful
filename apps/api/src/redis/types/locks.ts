import type { Lock } from "@upstash/lock";
import type { Redis } from "@upstash/redis";

import type { FN } from "@plateful/types";
import type { RateLimitLock } from "../models/rate-limit/lock";

export type RedisLock = Lock | RateLimitLock;

export type LockFactory<Args extends any[] = any[]> = FN<
	RedisLock,
	[redis: Redis, ...Args]
>;
