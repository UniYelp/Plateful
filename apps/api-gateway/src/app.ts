import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";

import { appConfig } from "./configs/app.config.js";
import { ENV } from "./configs/env.config.js";
import type { AppBindings } from "./ctx.js";
import { apiRoute } from "./routes/api.route.js";

export const app = new Hono<AppBindings>()
	.use(
		cors({
			origin: ENV.ALLOWED_ORIGINS,
		}),
	)
	.use(
		/**
		 * {@link https://clerk.com/changelog/2023-11-08}
		 */
		clerkMiddleware(),
	)
	.use(requestId(), logger(), prettyJSON())
	.get("/", (c) => {
		return c.text(`Welcome to ${appConfig.name}`);
	})
	.route("/api", apiRoute);

showRoutes(app, {
	verbose: true,
});

export type App = typeof app;
