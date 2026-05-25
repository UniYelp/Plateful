import { context, trace } from "@opentelemetry/api";
import dedent from "dedent";
import Elysia, { sse } from "elysia";

import type {
	ExtendedRecipeGenInput,
	RecipeGenOutput,
} from "@plateful/agents/recipes";
import { SafetyUtils } from "@plateful/agents/safety";
import { validateRecipe } from "@plateful/recipes";
import { ENV } from "../../configs/env.config";
import { LockedError } from "../../models/errors/locked";
import { RateLimitError } from "../../models/errors/rate-limit";
import { auth } from "../../plugins/auth.plugin";
import { logger } from "../../plugins/logger.plugin";
import { redis } from "../../plugins/redis.plugin";
import { RedisKeys } from "../../redis/keys";
import { RedisLocks } from "../../redis/locks";
import { RecipesModel } from "./model";
import * as RecipeService from "./service";

export const recipes = new Elysia({
	prefix: "recipes",
})
	.use(logger())
	.use(auth())
	.use(redis())
	.post(
		"generate",
		async function* ({ query: { householdId }, body, getRedis, log }) {
			// TODO: change to queue implementation using redis to mitigate rpm quotas
			const redis = getRedis();

			log.set({ household: { id: householdId } });

			log.info("Received request");

			const householdLock = RedisLocks.recipes.gen.household.lock(
				redis,
				householdId,
			);

			try {
				const acquired = await householdLock.acquire();

				log.set({ lock: { household: { acquired } } });

				if (!acquired) {
					throw new LockedError("You may only generate one recipe at a time");
				}

				const rphLock = RedisLocks.recipes.gen.household.rph(redis);

				const {
					success: hasRemaining,
					limit,
					reset,
				} = await rphLock.limit(
					RedisKeys.recipes.gen.household.rph(householdId),
				);

				log.set({ lock: { rph: { hasRemaining, resetAt: reset } } });

				if (!hasRemaining) {
					throw new RateLimitError(
						{ limit, resetAt: reset },
						"Household requests limit exceeded",
					);
				}

				yield sse({
					event: "started",
				});

				log.set({ event: { started: true } });

				// Criticizer-optimizer loop
				const tracer = trace.getTracer("recipe-generation");
				const span = tracer.startSpan("generate-recipe-flow");
				const activeContext = trace.setSpan(context.active(), span);

				try {
					span.setAttribute("householdId", householdId);
					span.setAttribute("langfuse.trace.input", JSON.stringify(body));

					const MAX_ATTEMPTS = 5;
					const SAFETY_THRESHOLD = 0.8;

					let finalRecipe: RecipeGenOutput | null = null;
					let finalSafetyScore: number | null = null;
					let currentBody: ExtendedRecipeGenInput = body;

					for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
						// Generate recipe
						log.set({ event: { working: { attempt } } });

						yield sse({
							event: "working",
						});

						const recipeResult = await context.with(activeContext, () =>
							RecipeService.generateRecipe(currentBody),
						);

						log.info("Generated recipe", {
							successful: recipeResult.type !== "unfeasible",
						});

						if (recipeResult.type === "unfeasible") {
							log.set({
								event: {
									unfeasible: true,
									reason: recipeResult.unfeasible?.reason,
								},
							});

							throw new Error(
								`Unable to produce a recipe: ${recipeResult.unfeasible?.reason}`,
							);
						}

						const recipeGen = recipeResult.recipe as RecipeGenOutput;

						finalRecipe = recipeGen;

						// Critique with safety agent
						log.set({ event: { safetyCheck: { attempt } } });

						yield sse({
							event: "safety-check",
						});

						const safetyResult = await context.with(activeContext, () =>
							RecipeService.safetyCheck({
								recipe: JSON.stringify(recipeGen),
								allergens: body.allergens,
								dietaryPreferences: body.dietaryPreferences,
							}),
						);

						if (safetyResult.injectedSteps.length) {
							const { result, stepModifications } =
								SafetyUtils.injectSafetySteps(
									recipeGen.steps,
									safetyResult.injectedSteps,
								);

							const reindexed = SafetyUtils.reindexCriticismsWithModifications(
								safetyResult.structuralCriticisms,
								stepModifications,
							);

							recipeGen.steps = result;
							safetyResult.structuralCriticisms = reindexed;
						}

						const rawScore = safetyResult.safetyScore;

						log.set({ event: { safetyCheck: { [attempt]: { rawScore } } } });

						finalSafetyScore = rawScore / 100;

						log.info("Reviewed recipe", {
							score: safetyResult.safetyScore,
						});

						// Static validation
						const validationResult = validateRecipe(recipeGen, currentBody);

						const hasStaticErrors = validationResult !== null;

						const isSafe = finalSafetyScore >= SAFETY_THRESHOLD;

						// Check if both safety score and static validation are acceptable
						if (isSafe && !hasStaticErrors) {
							break;
						}

						// If not acceptable and we have more attempts, prepare for retry
						if (attempt < MAX_ATTEMPTS) {
							let combinedCritique = safetyResult.reasoning;

							if (safetyResult.structuralCriticisms.length) {
								const structuralCriticismMessages = JSON.stringify(
									safetyResult.structuralCriticisms,
								);

								combinedCritique += dedent`
                                    The recipe failed the following structural safety criteria which you must fix:
                                    ${structuralCriticismMessages}
                                `;
							}

							if (hasStaticErrors) {
								const staticErrorMessages = validationResult.issues
									.map((issue) => `- ${issue.message}`)
									.join("\n");

								combinedCritique += `\n\nAdditionally, the recipe failed the following static validations which you must fix:\n${staticErrorMessages}`;
							}

							currentBody = {
								...body,
								safetyCritique: combinedCritique,
								previouslyGenerated: JSON.stringify(recipeResult),
							};
						}
					}

					if (finalRecipe === null || finalSafetyScore === null) {
						throw new Error("Failed to generate a recipe");
					}

					// We yield failed if either safety score is too low, or if static errors remain after max attempts
					const finalValidationResult = validateRecipe(
						finalRecipe,
						currentBody,
					);

					const finalHasStaticErrors = finalValidationResult !== null;
					const finalIsUnsafe = finalSafetyScore < SAFETY_THRESHOLD;

					if (finalIsUnsafe || finalHasStaticErrors) {
						log.set({
							event: {
								failed: {
									safetyScore: finalSafetyScore,
									hasStaticErrors: finalHasStaticErrors,
								},
							},
						});

						const isDev = ENV.NODE_ENV === "development";

						let errorMsg =
							"Unable to generate a safe and valid recipe after multiple attempts.";

						if (isDev && finalHasStaticErrors) {
							errorMsg +=
								"\n\nValidation issues:\n" +
								finalValidationResult.issues
									.map((i) => `- ${i.message}`)
									.join("\n");
						}

						yield sse({
							event: "failed",
							data: {
								error: isDev
									? `[DEV] safety error: ${errorMsg}`
									: "Unable to generate a safe and valid recipe.",
								safetyScore: finalSafetyScore,
							},
						});

						return;
					}

					span.setAttribute(
						"langfuse.trace.output",
						JSON.stringify(finalRecipe),
					);

					log.set({ event: { done: true } });

					yield sse({
						event: "done",
						data: finalRecipe,
					});
				} finally {
					span.end();
				}
			} catch (err) {
				let error: Error;

				if (err instanceof Error) {
					error = err;
				} else {
					error = new Error(JSON.stringify(err));
				}

				log.error(error);

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
