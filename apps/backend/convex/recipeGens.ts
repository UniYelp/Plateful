import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { apiClient } from "./configs/api.config";
import { notFound } from "./errors";
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
			.collect();

		return generations;
	},
});

export const byIdAndHousehold = householdQuery({
	args: {
		genId: vv.id("recipeGens"),
	},
	handler: async (ctx, args) => {
		const recipeGen = await ctx.db.get("recipeGens", args.genId);

		if (recipeGen?.householdId !== args.householdId || isSoftDeleted(recipeGen))
			throw notFound({ entity: "RecipeGen", in: "Household" });

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

export const update = internalMutation({
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

export const generateRecipe = internalAction({
	args: {
		genId: vv.id("recipeGens"),
		tags: vv.array(vv.string()),
		ingredients: vv.array(vRecipeGenIngredient),
	},
	handler: async (ctx, args) => {
		const { genId } = args;

		await ctx.runMutation(internal.recipeGens.update, {
			genId,
			user: SYSTEM_ID,
			state: {
				status: "generating",
			},
		});

		const ingredientIdByName = Object.fromEntries(
			args.ingredients.map((ing) => [ing.name, ing.id] as const),
		);

		const _ingredients = Object.keys(ingredientIdByName);

		// TODO: map the parameters, fetch response and map back

		// const { parameters: { tags, ingredients } } = args;

		try {
			const res = await apiClient.get();

			const { data, error } = res;

			if (data) {
				await ctx.runMutation(internal.recipeGens.update, {
					genId,
					user: SYSTEM_ID,
					state: {
						status: "failed",
						reason: "worked",
					},
				});
			} else {
				await ctx.runMutation(internal.recipeGens.update, {
					genId,
					user: SYSTEM_ID,
					state: {
						status: "failed",
						reason: error && JSON.stringify(error, null, 2),
					},
				});
			}

			// const _res = apiClient.recipes.generate.post({
			// 	tags,
			// 	ingredients: [],
			// });
		} catch (err) {
			await ctx.runMutation(internal.recipeGens.update, {
				genId,
				user: SYSTEM_ID,
				state: {
					status: "failed",
					reason: JSON.stringify(err, null, 2), // TODO: only in dev
				},
			});

			console.error(err);
		}
	},
});

// #endregion

// #region Helpers

// #endregion
