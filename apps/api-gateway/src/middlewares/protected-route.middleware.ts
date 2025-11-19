// import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";

// import { HttpStatusCode, ReasonByHttpStatus } from "@plateful/http";
import type { AppVariables } from "../ctx.js";

/**
 * TODO: figure out how to make this work
 */
export const protectedRouteMiddleware = createMiddleware<AppVariables>(
	async (_c, next) => {
		// const auth = getAuth(c);

		// if (!auth?.userId) {
		// 	c.status(HttpStatusCode.UNAUTHORIZED);
		// 	return c.json({
		// 		message: ReasonByHttpStatus.UNAUTHORIZED + ' | ' + JSON.stringify(auth),
		// 	});
		// }

		await next();
	},
);
