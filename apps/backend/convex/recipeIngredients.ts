import { bool } from "@plateful/utils";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { notFound } from "./errors";
import { householdQuery } from "./households";
import { vv } from "./schema";
import { isSoftDeleted } from "./utils/soft_delete";

// #region Queries

export const byRecipe = householdQuery({
	args: {
		recipeId: vv.id("recipes"),
	},
	handler: async (ctx, args) => {
		const recipeIngredients = await getRecipeIngredients(ctx, args.recipeId);
		return recipeIngredients;
	},
});

export const fullByRecipe = householdQuery({
	args: {
		recipeId: vv.id("recipes"),
	},
	handler: async (ctx, args) => {
		const recipe = await ctx.db.get("recipes", args.recipeId);

		ctx.validateHousehold(recipe);

		if (!recipe || isSoftDeleted(recipe)) {
			throw notFound({ entity: "Recipe", in: "Household" });
		}

		const recipeIngredients = await getRecipeIngredients(ctx, args.recipeId);

		const ingredients = await Promise.all(
			recipeIngredients.map(async (recipeIngredient) => {
				const ingredient = await ctx.db.get(
					"ingredients",
					recipeIngredient.ingredientId,
				);

				ctx.validateHousehold(ingredient);

				if (
					!ingredient ||
					isSoftDeleted(ingredient)
				)
					return;

				return {
					quantities: recipeIngredient.quantities,
					ingredient: ingredient,
				};
			}),
		);

		const steps = await ctx.db
			.query("recipeSteps")
			.withIndex("by_recipe_and_index", (q) => q.eq("recipeId", args.recipeId))
			.collect();

		return {
			recipe,
			ingredients: ingredients.filter(bool),
			steps,
		};
	},
});

export const fullByIngredient = householdQuery({
	args: {
		ingredientId: vv.id("ingredients"),
	},
	handler: async (ctx, args) => {
		const recipeIngredients = await ctx.db
			.query("recipeIngredients")
			.withIndex("by_ingredient_deletedAt_recipe", (q) =>
				q.eq("ingredientId", args.ingredientId).eq("deletedAt", undefined),
			)
			.collect();

		const data = await Promise.all(
			recipeIngredients.map(async (recipeIngredient) => {
				const recipe = await ctx.db.get("recipes", recipeIngredient.recipeId);

				if (!recipe || isSoftDeleted(recipe)) return null;
				return {
					recipe: {
						_id: recipe._id,
						title: recipe.title,
					},
					quantities: recipeIngredient.quantities,
				};
			}),
		);

		return data.filter(bool);
	},
});

// #endregion

// #region Helpers
export async function getRecipeIngredients(
	ctx: QueryCtx,
	recipeId: Id<"recipes">,
) {
	const recipes = await ctx.db
		.query("recipeIngredients")
		.withIndex("by_recipe_deletedAt_ingredient", (q) =>
			q.eq("recipeId", recipeId).eq("deletedAt", undefined),
		)
		.collect();

	return recipes;
}

// #endregion
