import Elysia from "elysia";

import { LockNotAcquired } from "../../errors/lock-not-acquired";
import { logger } from "../../plugins/logger";
import { redis } from "../../plugins/redis.plugin";
import { RecipesModel } from "./model";
import * as RecipeService from "./service";

export const recipes = new Elysia({
	prefix: "recipes",
})
	.use(redis())
	.use(logger())
	.error({
		LockNotAcquired,
	})
	.post(
		"generate",
		async ({ body, logger }) => {
			// const lock = RedisLocks.recipes.generate.user(redis, body.userId);

			// logger.log("acquiring lock for user", body.userId, "...");

			// const acquired = await lock.acquire();

			// if (!acquired) {
			// 	throw new LockNotAcquired("You may only generate one recipe at a time");
			// }

			// logger.log("acquired lock for user", body.userId, "...");

			try {
				logger.log("generating recipe for user", body.userId, "...");
				const result = await RecipeService.generateRecipe(body);
				logger.log("generated recipe for user", body.userId, "...");
				return result;
			} catch (err) {
				logger.error("error for user", body.userId, "...", err);
				throw err;
			} finally {
				// await lock.release();
			}
		},
		{
			body: RecipesModel.generateRecipeBody,
			response: {
				200: RecipesModel.generateRecipeResponse,
				[LockNotAcquired.status]: LockNotAcquired.$response,
			},
		},
	);
