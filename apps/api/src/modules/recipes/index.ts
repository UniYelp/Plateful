import Elysia, { sse } from "elysia";

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
		async function* ({ query: { householdId }, body, getRedis }) {
			const redis = getRedis();

			const userLock = RedisLocks.recipes.gen.household.lock(
				redis,
				householdId,
			);

			try {
				const acquired = await userLock.acquire();

				if (!acquired) {
					throw new LockedError("You may only generate one recipe at a time");
				}

				const rpuLock = RedisLocks.recipes.gen.household.rph(
					redis,
					householdId,
				);

				const { acquired: hasRemaining, resetAt } = await rpuLock.tryAcquire();

				if (!hasRemaining) {
					throw new RateLimitError(
						{ limit: rpuLock.limit, resetAt },
						"Household requests limit exceeded",
					);
				}

				yield sse({
					event: "started",
				});

				const result = await RecipeService.generateRecipe(body);

				yield sse({
					event: "done",
					data: result,
				});
			} catch (err) {
				let error: Error;

				if (err instanceof Error) {
					error = err;
				} else {
					error = new Error(JSON.stringify(err));
				}

				yield sse({
					event: "failed",
					data: {
						error: error.message,
					},
				});
			} finally {
				await userLock.release();
			}
		},
		{
			apiKey: true,
			query: RecipesModel.generateRecipeQuery,
			body: RecipesModel.generateRecipeBody,
			response: {
				[LockedError.status]: LockedError.$response,
				[RateLimitError.status]: RateLimitError.$response,
			},
		},
	);
