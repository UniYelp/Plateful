import type { RecipeGenInput } from "@plateful/agents/recipes";
import { TemperatureUnit } from "@plateful/units/temperature";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { apiClient } from "./configs/api.config";
import { InternalError, notFound } from "./errors";
import { internalMutation } from "./functions";
import { householdMutation, householdQuery } from "./households";
import { ingredientQuantityFields, vv, vvv } from "./schema";
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
				state: vv.optional(vv.string()),
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

		return generations;
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

// #endregion

// #region Actions

// TODO: convert to a workflow | https://www.convex.dev/components/workflow
export const generateRecipe = internalAction({
	args: {
		genId: vv.id("recipeGens"),
		tags: vv.array(vv.string()),
		ingredients: vv.array(vRecipeGenIngredient),
	},
	handler: async (ctx, args) => {
		const { genId } = args;

		await ctx.runMutation(internal.recipeGens.updateState, {
			genId,
			user: SYSTEM_ID,
			state: {
				status: "generating",
			},
		});

		const { tags, ingredients: ingredientsIn } = args;

		const ingredientIdByName = Object.fromEntries(
			ingredientsIn.map((ing) => [ing.name, ing.id] as const),
		);

		const collator = new Intl.Collator("und", { sensitivity: "base" });

		const hasWater = Object.keys(ingredientIdByName).some(
			(ing) => collator.compare(ing, "water") === 0,
		);

		const ingredients = ingredientsIn.flatMap<
			RecipeGenInput["ingredients"][number]
		>(({ name, quantities }) =>
			Array.isArray(quantities)
				? quantities.map(({ state, amount, unit }) => ({
						name,
						state: state || null,
						quantity: {
							value: amount,
							unit: unit || null,
						},
					}))
				: {
						name,
						state: null,
						quantity: "unlimited",
					},
		);

		if (!hasWater) {
			ingredients.push({
				name: "water",
				state: null,
				quantity: "unlimited",
			});
		}

		try {
			const user = await ctx.auth.getUserIdentity();

			const res = await apiClient.recipes.generate.post({
				userId: user?.subject || "unknown",
				ingredients,
				tags,
				temperatureUnit: TemperatureUnit.Celsius,
				toleratedSpiceLevel: "no-preference",
				tools: "unlimited",
			});

			const { data, error } = res;

			if (data) {
				await ctx.runMutation(internal.recipeGens.updateState, {
					genId,
					user: SYSTEM_ID,
					state: {
						status: "failed",
						reason: JSON.stringify(data, null, 2),
					},
				});

				return;
			}

			switch (error.status) {
				case 423: {
					throw new InternalError(error.value, { cause: error });
				}
				default: {
					throw new InternalError("Internal Error", { cause: error });
				}
			}
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
