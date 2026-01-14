import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import z from "zod";

import { appConfig } from "./configs/app.config";
import { ENV } from "./configs/env.config";
import { health } from "./modules/health";
import { recipes } from "./modules/recipes";
import { logger } from "./plugins/logger";
import { requestId } from "./plugins/request-id";

/**
 * @see {@link https://elysiajs.com/essential/best-practice}
 */
export const app = new Elysia({ adapter: node() })
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
	.use(serverTiming())
	// .use(clerkPlugin())
	// .use(auth())
	.use(requestId())
	.use(logger({ name: appConfig.name }))
	.get("/", () => `Welcome to ${appConfig.name}`)
	// .get(
	// 	"/protected",
	// 	async ({ /**user,*/ clerk, auth, status }) => {
	// 		const { userId } = auth(); //! still does not work

	// 		/**
	// 		 * Access the auth state in the context.
	// 		 * See the AuthObject here https://clerk.com/docs/references/nextjs/auth-object#auth-object
	// 		 */
	// 		if (!userId) {
	// 			return status(401);
	// 		}

	// 		/**
	// 		 * For other resource operations, you can use the clerk client from the context.
	// 		 * See what other utilities Clerk exposes here https://clerk.com/docs/references/backend/overview
	// 		 */
	// 		const user = await clerk.users.getUser(userId);
	// 		return `Welcome to ${appConfig.name} | ${user.fullName}`;
	// 	},
	// 	{
	// 		// auth: true,
	// 	},
	// )
	.use(health)
	.use(recipes);

export type App = typeof app;
