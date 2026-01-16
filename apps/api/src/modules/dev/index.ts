import Elysia from "elysia";

import { dev } from "../../plugins/dev.plugin";
import { logger } from "../../plugins/logger.plugin";
import { redis } from "../../plugins/redis.plugin";

export const devOnly = new Elysia({
	prefix: "dev",
})
	.use(dev())
	.use(redis())
	.use(logger());
