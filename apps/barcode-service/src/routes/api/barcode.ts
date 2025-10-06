import { getAuth } from "@hono/clerk-auth";
import { Hono } from "hono";

import type { ProtectedRouteBindings } from "../../ctx.js";
import { protectedBindingsMiddleware } from "../../middlewares/protected-bindings.middleware.js";
import { protectedRouteMiddleware } from "../../middlewares/protected-route.middleware.js";

export const barcodeRoute = new Hono<ProtectedRouteBindings>()
	.use(protectedRouteMiddleware, protectedBindingsMiddleware)
	.get("/", (c) => {
		const auth = getAuth(c);

		return c.json({ auth: auth?.isAuthenticated });
	});
