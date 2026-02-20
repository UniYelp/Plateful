import { Duration } from "luxon";

import type { RecipeGenInput } from "@plateful/agents/recipes";
import type { IngredientUnit } from "@plateful/ingredients";
import type { StrictOmit } from "@plateful/types";
import { TemperatureUnit } from "@plateful/units/temperature";
import { Arr, bool, entriesOf } from "@plateful/utils";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { apiClient } from "./configs/api.config";
import { ENV } from "./configs/env.config";
import { nanoBanana } from "./configs/nano-banana.config";
import { InternalError, notFound } from "./errors";
import { internalMutation } from "./functions";
import { householdMutation, householdQuery } from "./households";
import type { FullRecipeGenDoc } from "./recipeGens.exports";
import {
	type EntityShape,
	type IngredientQuantity,
	ingredientQuantityFields,
	recipeFields,
	recipeIngredientFields,
	recipeStepFields,
	vv,
	vvv,
} from "./schema";
import { isSoftDeleted, notDeletedIndex } from "./utils/soft_delete";
import { SYSTEM_ID } from "./values";

// #region Validations

const vRecipeGen = vv.doc("recipeGens");
const vRecipeGenState = vRecipeGen.pick("state").fields.state;

const vRecipeGenIngredient = vv.object({
	id: vv.id("ingredients"),
	name: vv.string(),
	quantities: vv.union(
		vv.array(
			vv.object({
				...ingredientQuantityFields,
				// state: vv.optional(vv.string()),
				expiresAt: vv.optional(vvv.timestamp()),
			}),
		),
		vv.literal("unlimited"),
	),
});

// #endregion

// #region Queries

export const byHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const generations = await ctx.db
			.query("recipeGens")
			.withIndex("by_household_deletedAt", (q) =>
				q.eq("householdId", args.householdId).eq(...notDeletedIndex),
			)
			.order("desc")
			.take(5);

		const gensWithTitle = await Promise.all(
			generations.map(async (gen) => {
				if (gen.state.status !== "completed") return gen as FullRecipeGenDoc;

				const recipe = await ctx.db.get("recipes", gen.state.recipeId);

				return {
					...gen,
					title: recipe?.title,
				} satisfies FullRecipeGenDoc;
			}),
		);

		return gensWithTitle;
	},
});

export const byIdAndHousehold = householdQuery({
	args: {
		genId: vv.string(),
	},
	handler: async (ctx, args) => {
		const genId = ctx.db.normalizeId("recipeGens", args.genId);

		if (!genId) {
			throw notFound({ entity: "recipe generation", by: "household" });
		}

		const recipeGen = await ctx.db.get("recipeGens", genId);

		ctx.validateHousehold(recipeGen);

		if (!recipeGen || isSoftDeleted(recipeGen)) {
			throw notFound({ entity: "recipe generation", by: "household" });
		}

		return recipeGen;
	},
});

export const stats = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const now = new Date();

		const utcMidnightNow = Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate(),
		);

		const maxDailyGen = 5;

		const generationsToday = await ctx.db
			.query("recipeGens")
			.withIndex("by_household_deletedAt", (q) =>
				q
					.eq("householdId", args.householdId)
					.eq(...notDeletedIndex)
					.gte("_creationTime", utcMidnightNow),
			)
			.order("desc")
			.take(maxDailyGen);

		const currentGen = generationsToday.find(
			(gen) =>
				gen.state.status === "generating" || gen.state.status === "pending",
		);

		return {
			activeGenID: currentGen?._id,
			today: {
				total: generationsToday.length,
				max: maxDailyGen,
			},
		};
	},
});

// #endregion

// #region Mutations

export const start = householdMutation({
	args: {
		tags: vv.array(vv.string()),
		ingredients: vv.array(vRecipeGenIngredient),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const { _id: userId } = ctx.user;
		const { householdId, tags, ingredients } = args;

		const genId = await ctx.db.insert("recipeGens", {
			householdId,
			state: {
				status: "pending",
			},
			metadata: {
				version: "v0",
				tags,
				ingredients: ingredients.map((ing) => ing.id),
			},
			createdBy: userId,
			updatedBy: userId,
			updatedAt: now,
		});

		await ctx.scheduler.runAfter(0, internal.recipeGens.generateRecipe, {
			genId,
			householdId,
			tags,
			ingredients,
		});

		return genId;
	},
});

export const updateState = internalMutation({
	args: {
		genId: vv.id("recipeGens"),
		user: vvv.userStamp(),
		state: vRecipeGenState,
	},
	handler: async (ctx, args) => {
		const { genId, state, user } = args;

		const now = Date.now();

		await ctx.db.patch("recipeGens", genId, {
			state,
			updatedBy: user,
			updatedAt: now,
		});
	},
});

export const completeGen = internalMutation({
	args: {
		user: vvv.userStamp(),
		genId: vv.id("recipeGens"),
		recipe: vv.object(recipeFields),
		ingredients: vv.array(vv.object(recipeIngredientFields).omit("recipeId")),
		steps: vv.array(recipeStepFields.blocks),
	},
	handler: async (ctx, args) => {
		const { user, recipe, genId } = args;

		const now = Date.now();

		const recipeId = await ctx.db.insert("recipes", {
			householdId: recipe.householdId,
			genId,
			type: recipe.type,
			title: recipe.title,
			description: recipe.description,
			tags: recipe.tags,
			keywords: recipe.keywords,
			cookTime: recipe.cookTime,
			prepTime: recipe.prepTime,
			notes: recipe.notes,
			createdBy: user,
			updatedBy: user,
			updatedAt: now,
		});

		const ingredientPromises = args.ingredients.map(
			async (ing) =>
				await ctx.db.insert("recipeIngredients", {
					recipeId,
					ingredientId: ing.ingredientId,
					quantities: ing.quantities,
					createdBy: user,
					updatedBy: user,
					updatedAt: now,
				}),
		);

		const stepsPromises = args.steps.map(
			async (blocks, idx) =>
				await ctx.db.insert("recipeSteps", {
					recipeId,
					index: idx,
					blocks,
					createdBy: user,
					updatedBy: user,
					updatedAt: now,
				}),
		);

		await Promise.all([...ingredientPromises, ...stepsPromises]);

		await ctx.db.patch("recipeGens", genId, {
			state: {
				status: "completed",
				recipeId,
			},
			updatedBy: user,
			updatedAt: now,
		});

		await ctx.scheduler.runAfter(0, internal.recipeGens.finalizeRecipeGen, {
			genId,
			recipeId,
			imgPrompt: `Generate an image that matches the following recipe's details
            ---
            Title: ${recipe.title}
            Description: ${recipe.description || "---"}
            Tags: ${recipe.tags.join(", ")}
            `,
		});
	},
});

// #endregion

// #region Actions

export const finalizeRecipeGen = internalAction({
	args: {
		genId: vv.id("recipeGens"),
		recipeId: vv.id("recipes"),
		imgPrompt: vv.string(),
	},
	handler: async (ctx, args) => {
		const imgGenId = await nanoBanana.generate(ctx, {
			userId: SYSTEM_ID,
			prompt: args.imgPrompt,
			aspectRatio: "16:9",
		});

		await ctx.runMutation(internal.recipeGens.updateState, {
			genId: args.genId,
			user: SYSTEM_ID,
			state: {
				status: "completed",
				recipeId: args.recipeId,
				imgGenId,
			},
		});
	},
});

// TODO: convert to a workflow | https://www.convex.dev/components/workflow
export const generateRecipe = internalAction({
	args: {
		genId: vv.id("recipeGens"),
		householdId: vv.id("households"),
		tags: vv.array(vv.string()),
		ingredients: vv.array(vRecipeGenIngredient),
	},
	handler: async (ctx, args) => {
		const { genId, householdId } = args;

		await ctx.runMutation(internal.recipeGens.updateState, {
			genId,
			user: SYSTEM_ID,
			state: {
				status: "generating",
			},
		});

		const { tags } = args;

		const ingredientIdByName = Object.fromEntries(
			args.ingredients.map((ing) => [ing.name, ing.id] as const),
		);

		const collator = new Intl.Collator("und", { sensitivity: "base" });

		const hasWater = Object.keys(ingredientIdByName).some(
			(ing) => collator.compare(ing, "water") === 0,
		);

		const ingredients = args.ingredients.flatMap<
			RecipeGenInput["ingredients"][number]
		>(({ name, quantities }) =>
			Array.isArray(quantities)
				? quantities.map(({ /**state, */ amount, unit }) => ({
						name,
						// state: state || null,
						quantity: {
							value: amount,
							unit: (unit as IngredientUnit) || null,
						},
					}))
				: {
						name,
						// state: null,
						quantity: "unlimited",
					},
		);

		if (!hasWater) {
			ingredients.push({
				name: "water",
				// state: null,
				quantity: "unlimited",
			});
		}

		console.log({ ingredientIdByName, hasWater });

		try {
			const res = await apiClient.recipes.generate.post(
				{
					ingredients,
					tags,
					temperatureUnit: TemperatureUnit.Celsius,
					toleratedSpiceLevel: "no-preference",
					tools: "unlimited",
				},
				{
					query: {
						householdId,
					},
					headers: {
						"x-api-key": ENV.API_KEY,
					},
				},
			);

			const { data, error } = res;

			if (error) {
				switch (error.status) {
					default: {
						console.error(error);
						throw new InternalError("Internal Error", { cause: error });
					}
				}
			}

			for await (const chunk of data) {
				switch (chunk.event) {
					case "started": {
						continue;
					}
					case "done": {
						const { data } = chunk;
						const { householdId } = args;

						const { title, description, tags, steps, notes } = data;

						console.log({ genId, notes, data });

						const stepTokensToSanitize = [
							"cookTime",
							"prepTime",
							"description",
							"title",
							"keywords",
							"notes",
							"tags",
							"steps",
						] satisfies (keyof EntityShape<"recipes"> | "steps")[];

						const detailsByIngredient = Object.groupBy(
							steps.flatMap((parts) =>
								parts.flatMap((part) => {
									if (part.type !== "material") return [];
									if (part.kind !== "input") return [];

									const { name, quantity /**state */ } = part;
									const { value, unit } = quantity;

									if (!hasWater && collator.compare(name, "water") === 0) {
										return [];
									}

									return {
										name,
										quantity: {
											amount: value,
											unit,
										} satisfies IngredientQuantity,
										// state,
									};
								}),
							),
							(ing) => ing.name,
						);

						const ingredients = entriesOf(detailsByIngredient).flatMap(
							([name, details]) => {
								if (!details) return [];

								const ingredientId = ingredientIdByName[name];

								if (!ingredientId) {
									console.warn(
										`Ingredient "${name}" not found in household ingredients, skipping`,
									);

									return [];
								}

								return {
									ingredientId,
									quantities: details.flatMap(({ quantity /**state */ }) => ({
										...quantity,
										// state,
									})),
								} satisfies StrictOmit<
									EntityShape<"recipeIngredients">,
									"recipeId"
								>;
							},
						);

						const timeByKind = Object.groupBy(
							steps.flatMap((parts) =>
								parts.flatMap((part) => {
									if (part.type !== "duration") return [];

									return part;
								}),
							),
							(part) => part.kind,
						);

						const prepTime =
							timeByKind.prep
								?.reduce((acc, d) => {
									const currDuration = Duration.fromISO(d.duration);
									return acc.plus(currDuration);
								}, Duration.fromMillis(0))
								.toISO() ?? null;

						const cookTime =
							timeByKind.cook
								?.reduce((acc, d) => {
									const currDuration = Duration.fromISO(d.duration);
									return acc.plus(currDuration);
								}, Duration.fromMillis(0))
								.toISO() ?? null;

						const recipe: EntityShape<"recipes"> = {
							type: "simple",
							householdId,
							title,
							description,
							tags,
							keywords: [],
							cookTime,
							prepTime,
						};

						await ctx.runMutation(internal.recipeGens.completeGen, {
							genId,
							user: SYSTEM_ID,
							recipe,
							ingredients,
							steps: steps
								.map((parts) => {
									const [firstPart] = parts;

									if (
										typeof firstPart === "string" &&
										Arr.includes(stepTokensToSanitize, firstPart)
									) {
										console.warn("sanitizing step from recipe", parts);
										return null;
									}

									return parts.map((part) => {
										if (part.type === "duration") {
											const { kind, duration } = part;
											return {
												type: "duration" as const,
												kind,
												value: duration,
											};
										}

										if (part.type === "material") {
											const {
												type,
												kind,
												name,
												quantity: quantityData,
												// state,
											} = part;

											const { value: amount, unit } = quantityData;

											const ingredientId = ingredientIdByName[name];

											const ingredient =
												kind === "input" && ingredientId
													? { id: ingredientId }
													: { name };

											const quantity = {
												amount,
												unit,
											} satisfies IngredientQuantity;

											return {
												type,
												kind,
												ingredient,
												quantity /**state */,
											} as const;
										}

										return part;
									});
								})
								.filter(bool),
						});

						return;
					}
					case "failed": {
						const {
							data: { error },
						} = chunk;

						throw new InternalError(error, { cause: error });
					}
					default: {
						const _exhaustive: never = chunk;
						continue;
					}
				}
			}

			throw new InternalError("Internal Error", {
				cause: "Stream ended without completion",
			});
		} catch (err) {
			await ctx.runMutation(internal.recipeGens.updateState, {
				genId,
				user: SYSTEM_ID,
				state: {
					status: "failed",
					reason: err instanceof InternalError ? err.message : "Internal Error",
				},
			});

			console.error(err);
		}
	},
});

// #endregion

// #region Helpers

// #endregion
