import { randomUUID } from "node:crypto";
import { cron, Patterns } from "@elysiajs/cron";
import Elysia from "elysia";

import { redis } from "../../configs/redis.config";
import { RedisKeys } from "../../redis/keys";

export const health = new Elysia({ prefix: "/health" })
	.get("/", "healthy")
	.use(
		cron({
			name: "heartbeat",
			pattern: Patterns.everyMinute(),
			run() {
				console.log("Heartbeat");
			},
		}),
	)
	.use(
		cron({
			name: "redis-ping",
			pattern: Patterns.everyMinutes(5),
			async run() {
				const id = randomUUID();
				const key = RedisKeys.health(id);

				await redis.setex(key, 30, true satisfies typeof key.$type);
				console.log("Redis Ping");
			},
			catch: (err) => {
				console.error(err);
			},
		}),
	);
