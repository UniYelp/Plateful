import Elysia from "elysia";

import { LockNotAcquired } from "../../errors/lock-not-acquired";
import { redis } from "../../plugins/redis.plugin";
import { RecipesModel } from "./model";
import * as RecipeService from "./service";

export const recipes = new Elysia({
	prefix: "recipes",
})
	.use(redis())
	.error({
		LockNotAcquired,
	})
	.post(
		"generate",
		async ({ body }) => {
			// const lock = RedisLocks.recipes.generate.user(redis, body.userId);

			// console.log("acquiring lock for user", body.userId, "...");

			// const acquired = await lock.acquire();

			// if (!acquired) {
			// 	throw new LockNotAcquired("You may only generate one recipe at a time");
			// }

			console.log("acquired lock for user", body.userId, "...");

			try {
				console.log("generating recipe for user", body.userId, "...");
				const result = await RecipeService.generateRecipe(body);
				console.log("generated recipe for user", body.userId, "...");
				console.log({ result });
				return result;
			} catch (err) {
				console.log("error for user", body.userId, "...", err);
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
