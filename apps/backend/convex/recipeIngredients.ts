import { bool } from "@plateful/utils";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { householdQuery } from "./households";
import { vv } from "./schema";

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

export const byIngredient = householdQuery({
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
			recipeIngredients.map(async (ri) => {
				const recipe = await ctx.db.get("recipes", ri.recipeId);

				if (!recipe) return null;
				return {
					recipe: {
						_id: recipe._id,
						title: recipe.title,
					},
					quantity: ri.quantity,
				};
			}),
		);

		return data.filter(bool);
	},
});

// #endregion

// #region Helpers
async function getRecipeIngredients(ctx: QueryCtx, recipeId: Id<"recipes">) {
	const recipes = await ctx.db
		.query("recipeIngredients")
		.withIndex("by_recipe_deletedAt_ingredient", (q) =>
			q.eq("recipeId", recipeId).eq("deletedAt", undefined),
		)
		.collect();

	return recipes;
}

// #endregion
