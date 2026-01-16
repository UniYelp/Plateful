import { Elysia } from "elysia";

import { redis as redisClient } from "../configs/redis.config";
import { LockNotAcquiredError } from "../errors/models/lock-not-acquired";
// import { RedisLocks } from "../redis/locks";

export const RedisPluginName = "redis.Plugin";

// type LockMacroOptions = {};

export const redis = () =>
	new Elysia({
		name: RedisPluginName,
	})
		.error({
			LockNotAcquiredError,
		})
		.decorate("getRedis", () => redisClient);
// .macro({
// 	lock: {
// 		async resolve({ getRedis }) {
// 			const redis = getRedis();

// 			const lock = RedisLocks.recipes.generate.user(redis, ...args);

// 			const acquired = await lock.acquire();

// 			if (!acquired) {
// 				throw new LockNotAcquiredError(
// 					"You may only generate one recipe at a time",
// 				);
// 			}

// 			try {
// 				return acquired;
// 			} finally {
// 				// await lock.release();
// 			}
// 		},
// 	},
// });
