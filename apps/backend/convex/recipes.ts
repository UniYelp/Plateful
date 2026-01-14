import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { notFound } from "./errors";
import { internalMutation } from "./functions";
import { householdQuery } from "./households";
import { vv } from "./schema";
import { isSoftDeleted } from "./utils/soft_delete";

// #region Queries

export const byHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const recipes = await getHouseholdRecipes(ctx, args.householdId);
		return recipes;
	},
});

export const countByHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const recipes = await getHouseholdRecipes(ctx, args.householdId);
		return recipes.length;
	},
});

export const byIdAndHousehold = householdQuery({
	args: {
		recipeId: vv.id("recipes"),
	},
	handler: async (ctx, args) => {
		const recipe = await ctx.db.get("recipes", args.recipeId);

		if (recipe?.householdId !== args.householdId || isSoftDeleted(recipe))
			throw notFound({ entity: "Recipe", in: "Household" });

		return recipe;
	},
});

// #endregion

// #region Mutations

// #endregion

// #region Helpers

async function getHouseholdRecipes(
	ctx: QueryCtx,
	householdId: Id<"households">,
) {
	const recipes = await ctx.db
		.query("recipes")
		.withIndex("by_household_deletedAt_title", (q) =>
			q.eq("householdId", householdId).eq("deletedAt", undefined),
		)
		.collect();

	return recipes;
}

// #endregion
