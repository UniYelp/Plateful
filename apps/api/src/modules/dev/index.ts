import Elysia, { t } from "elysia";

import { dev } from "../../plugins/dev.plugin";
import { redis } from "../../plugins/redis.plugin";
import { RedisKeys } from "../../redis/keys";
import { RedisLocks } from "../../redis/locks";

export const devOnly = new Elysia({
	prefix: "dev",
})
	.use(dev({ mode: "always" }))
	.use(redis())
	.get(
		"lock",
		async ({ query: { name }, getRedis }) => {
			const redis = getRedis();

			const lock = RedisLocks.recipes.gen.household.rph(redis);

			const res = await lock.limit(RedisKeys.recipes.gen.household.rph(name));

			if (!res.success) {
				return "bad";
			}

			const { limit, remaining, reset } = res;

			return { limit, remaining, reset };
		},
		{
			dev: true,
			query: t.Object({
				name: t.String(),
			}),
		},
	);
