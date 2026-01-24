import Elysia, { t } from "elysia";

import { HttpStatusCode } from "@plateful/http";
import { RateLimitError } from "../../models/errors/rate-limit";
import { dev } from "../../plugins/dev.plugin";
import { redis } from "../../plugins/redis.plugin";
import { RedisLocks } from "../../redis/locks";

export const devOnly = new Elysia({
	prefix: "dev",
})
	.use(dev({ mode: "always" }))
	.use(redis())
	.get(
		"lock/:userId",
		async ({ getRedis, params }) => {
			const redis = getRedis();

			const rpuLock = RedisLocks.recipes.generate.user.rpu(
				redis,
				params.userId,
			);

			const {
				acquired: hasRemaining,
				remaining,
				resetAt,
			} = await rpuLock.tryAcquire();

			if (!hasRemaining) {
				throw new RateLimitError(
					{ limit: rpuLock.limit, resetAt },
					"User requests limit exceeded",
				);
			}

			return { remaining };
		},
		{
			response: {
				[HttpStatusCode.OK]: t.Object({
					remaining: t.Number(),
				}),
				[RateLimitError.status]: RateLimitError.$response,
			},
		},
	);
