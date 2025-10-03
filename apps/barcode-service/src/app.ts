import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { every } from "hono/combine";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { appConfig } from "./configs/app.config.js";
import { ENV } from "./configs/env.config.js";
import type { AppBindings } from "./ctx.js";
import { barcodeRoute } from "./routes/api/barcode.js";

export const app = new Hono<AppBindings>()
	.use(
		every(
			cors({
				origin: ENV.ALLOWED_ORIGINS,
			}),
			csrf({ origin: ENV.ALLOWED_ORIGINS }),
		),
	)
	.use(
		/**
		 * {@link https://clerk.com/changelog/2023-11-08}
		 */
		clerkMiddleware(),
	)
	// .use("/favicon.ico", serveStatic({ path: "assets/favicon.ico" }))
	.use(requestId(), logger(), prettyJSON())
	.get("/", (c) => {
		return c.text(`Welcome to ${appConfig.name}`);
	})
	.route("/api/barcode", barcodeRoute);

export type App = typeof app;
