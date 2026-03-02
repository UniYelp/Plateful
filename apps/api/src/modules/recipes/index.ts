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

			const householdLock = RedisLocks.recipes.gen.household.lock(
				redis,
				householdId,
			);

			try {
				const acquired = await householdLock.acquire();

				if (!acquired) {
					throw new LockedError("You may only generate one recipe at a time");
				}

				const rphLock = RedisLocks.recipes.gen.household.rph(
					redis,
					householdId,
				);

				const { acquired: hasRemaining, resetAt } = await rphLock.tryAcquire();

				if (!hasRemaining) {
					throw new RateLimitError(
						{ limit: rphLock.limit, resetAt },
						"Household requests limit exceeded",
					);
				}

				yield sse({
					event: "started",
				});

				// Criticizer-optimizer loop
				const MAX_ATTEMPTS = 5;
				const SAFETY_THRESHOLD = 0.8;
				let finalRecipe: RecipesModel.GenerateRecipeCompleteEventData | null =
					null;
				let finalSafetyScore: number | null = null;
				let currentBody = body;

				for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
					// Generate recipe
					yield sse({
						event: "working"
					});

					const recipeResult = await RecipeService.generateRecipe(currentBody);
					finalRecipe = recipeResult;

					// Critique with safety agent
					yield sse({
						event: "safety-check"
					});

					const safetyResult = await RecipeService.safetyCheck(JSON.stringify(recipeResult));
					finalSafetyScore = safetyResult.score ?? null;

					// Check if safety score is acceptable
					if (
						finalSafetyScore !== null &&
						finalSafetyScore >= SAFETY_THRESHOLD
					) {
						break;
					}

					// If not acceptable and we have more attempts, prepare for retry
					if (attempt < MAX_ATTEMPTS) {
						currentBody = {
							...body,
							safetyCritique: safetyResult.text,
							previouslyGenerated: JSON.stringify(recipeResult),
						};
					}
				}

				if (finalRecipe === null || finalSafetyScore === null) {
					throw new Error("Failed to generate a recipe");
				}

				if (finalSafetyScore !== null && finalSafetyScore < SAFETY_THRESHOLD) {
					yield sse({
						event: "failed",
						data: {
							error: "Unable to generate a safe recipe after multiple attempts",
							safetyScore: finalSafetyScore,
						},
					});
					return;
				}

				yield sse({
					event: "done",
					data: finalRecipe,
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
				await householdLock.release();
			}
		},
		{
			apiKey: true,
			query: RecipesModel.generateRecipeQuery,
			body: RecipesModel.generateRecipeBody,
		},
	);
