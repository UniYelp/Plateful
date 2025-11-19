import { createMiddleware } from "hono/factory";

import {
	HttpStatusCode,
	PLATEFUL_KEY_HEADER,
	ReasonByHttpStatus,
} from "@plateful/http";
import { ENV } from "../configs/env.config.js";
import type { ProtectedRouteContext } from "../ctx.js";

export const protectedApiMiddleware = createMiddleware<ProtectedRouteContext>(
	async (c, next) => {
		const header = c.req.header(PLATEFUL_KEY_HEADER);

		if (header !== ENV.API_KEY) {
			c.status(HttpStatusCode.UNAUTHORIZED);
			return c.json({
				message: ReasonByHttpStatus.UNAUTHORIZED,
			});
		}

		await next();
	},
);
