import Elysia from "elysia";

import { LockNotAcquired } from "../../errors/lock-not-acquired";
import { redis } from "../../plugins/redis.plugin";
import { RedisLocks } from "../../redis/locks";
import { RecipesModel } from "./model";
import * as RecipeService from "./service";

export const recipes = new Elysia({
	prefix: "recipes",
})
	.use(redis())
	.error({
		LockNotAcquired,
	})
	// .onError(({ code, error, status }) => {
	// 	switch (code) {
	// 		case "LockNotAcquired":
	// 			return status(error.status, error.message);
	// 	}
	// })
	.post(
		"generate",
		async ({ body, redis }) => {
			const lock = RedisLocks.recipes.generate.user(redis, body.userId);

			const acquired = await lock.acquire();

			if (!acquired) {
				throw new LockNotAcquired("You may only generate one recipe at a time");
			}

			try {
				const result = await RecipeService.generateRecipe(body);
				return result;
			} finally {
				await lock.release();
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
