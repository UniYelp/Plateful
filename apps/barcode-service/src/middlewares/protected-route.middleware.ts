import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import type { ProtectedRouteContext } from "../ctx.js";

export const protectedRouteMiddleware = createMiddleware<ProtectedRouteContext>(
	async (c, next) => {
		const auth = getAuth(c);

		if (!auth?.userId) {
			c.status(401);
			return c.json({
				message: "Unauthorized",
			});
		}

		await next();
	},
);
