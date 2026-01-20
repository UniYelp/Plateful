import Elysia from "elysia";

import { HttpStatusCode } from "@plateful/http";
import { LockedError } from "../../models/errors/locked";
import { RateLimitError } from "../../models/errors/rate-limit";
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
	.post(
		"generate",
		async ({ body, getRedis }) => {
			const redis = getRedis();

			const userLock = RedisLocks.recipes.generate.user.index(
				redis,
				body.userId,
			);

			const acquired = await userLock.acquire();

			if (!acquired) {
				throw new LockedError("You may only generate one recipe at a time");
			}

			try {
				const rpuLock = RedisLocks.recipes.generate.user.rpu(
					redis,
					body.userId,
				);

				const { acquired: hasRemaining, resetAt } = await rpuLock.tryAcquire();

				if (!hasRemaining) {
					throw new RateLimitError(
						{ limit: rpuLock.limit, resetAt },
						"User requests limit exceeded",
					);
				}

				const result = await RecipeService.generateRecipe(body);
				return result;
			} finally {
				await userLock.release();
			}
		},
		{
			apiKey: true,
			body: RecipesModel.generateRecipeBody,
			response: {
				[HttpStatusCode.OK]: RecipesModel.generateRecipeResponse,
				[LockedError.status]: LockedError.$response,
				[RateLimitError.status]: RateLimitError.$response,
			},
		},
	);
