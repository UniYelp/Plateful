import { createMiddleware } from "hono/factory";

import { redis } from "../configs/redis.config.js";
import type { ProtectedRouteContext } from "../ctx.js";

export const protectedBindingsMiddleware =
	createMiddleware<ProtectedRouteContext>(async (c, next) => {
		c.set("redis", redis);
		await next();
	});
