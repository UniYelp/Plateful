// import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";

import { appConfig } from "./configs/app.config.js";
import type { AppBindings } from "./ctx.js";
import { protectedApiMiddleware } from "./middlewares/protected-api.middleware.js";
import { barcodeRoute } from "./routes/api/barcode.route.js";

export const app = new Hono<AppBindings>()
	.use(protectedApiMiddleware)
	.use(requestId(), logger(), prettyJSON())
	.get("/", (c) => {
		return c.text(`Welcome to ${appConfig.name}`);
	})
	.route("/api/barcode", barcodeRoute);

showRoutes(app, {
	verbose: true,
});

export type App = typeof app;
