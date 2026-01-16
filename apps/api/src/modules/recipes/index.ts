import Elysia from "elysia";

import { LockNotAcquiredError } from "../../errors/models/lock-not-acquired";
import { auth } from "../../plugins/auth.plugin";
import { logger } from "../../plugins/logger.plugin";
import { redis } from "../../plugins/redis.plugin";
import { RedisLocks } from "../../redis/locks";
import { RecipesModel } from "./model";
import * as RecipeService from "./service";

export const recipes = new Elysia({
	prefix: "recipes",
})
	.use(auth())
	.use(redis())
	.use(logger())
	.error({
		LockNotAcquiredError,
	})
	.post(
		"generate",
		async ({ body, logger, getRedis }) => {
			const redis = getRedis();

			const lock = RedisLocks.recipes.generate.user(redis, body.userId);

			logger.log("acquiring lock for user", body.userId, "...");

			const acquired = await lock.acquire();

			if (!acquired) {
				throw new LockNotAcquiredError(
					"You may only generate one recipe at a time",
				);
			}

			logger.log("acquired lock for user", body.userId, "...");

			try {
				logger.log("generating recipe for user", body.userId, "...");
				const result = await RecipeService.generateRecipe(body);
				logger.log("generated recipe for user", body.userId, "...");
				return result;
			} catch (err) {
				logger.error("error for user", body.userId, "...", err);
				throw err;
			} finally {
				await lock.release();
			}
		},
		{
			apiKey: true,
			body: RecipesModel.generateRecipeBody,
			response: {
				200: RecipesModel.generateRecipeResponse,
				[LockNotAcquiredError.status]: LockNotAcquiredError.$response,
			},
		},
	);
