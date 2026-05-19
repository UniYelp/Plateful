import "./instruments"; //! must be the first import

import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { clerkPlugin } from "elysia-clerk";
import { initLogger } from "evlog";
import z from "zod";

import { appConfig } from "./configs/app.config";
import { ENV } from "./configs/env.config";
import { LockedError } from "./models/errors/locked";
import { RateLimitError } from "./models/errors/rate-limit";
import { devOnly } from "./modules/dev/index";
import { health } from "./modules/health";
import { receipts } from "./modules/receipts";
import { recipes } from "./modules/recipes";
import { auth } from "./plugins/auth.plugin";
import { logger } from "./plugins/logger.plugin";
import { requestId } from "./plugins/request-id.plugin";

initLogger({
	env: {
		service: appConfig.name,
	},
});

/**
 * @see {@link https://elysiajs.com/essential/best-practice}
 */
export const app = new Elysia({ adapter: node() })
	.use(requestId())
	.use(logger())
	.use(
		cors({
			origin: ENV.ALLOWED_ORIGINS,
		}),
	)
	.use(
		openapi({
			enabled: process.env.NODE_ENV !== "production",
			mapJsonSchema: {
				zod: z.toJSONSchema,
			},
		}),
	)
	.error({
		LockedError,
		RateLimitError,
	})
	.onError(({ code, error }) => {
		switch (code) {
			case "RateLimitError": {
				return error.toResponse();
			}
		}
	})
	.use(serverTiming())
	.use(clerkPlugin())
	.use(auth())
	.get("/", () => `Welcome to ${appConfig.name}`)
	.use(health)
	.use(recipes)
	.use(receipts)
	.use(devOnly);

export type App = typeof app;
