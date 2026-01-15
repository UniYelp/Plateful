import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { nanoBanana } from "./configs/nano-banana.config";
import { notFound } from "./errors";
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

		if (recipe?.householdId !== args.householdId || isSoftDeleted(recipe)) {
			throw notFound({
				entity: "Recipe",
				in: "Household",
			});
		}

		if (!recipe.genId) return recipe;

		const imgGen = await getRecipeGenImage(ctx, recipe.genId);

		return Object.assign(recipe, { imgGen });
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

	const recipesWithImg = await Promise.all(
		recipes.map(async (recipe) => {
			if (!recipe.genId) return recipe;

			const imgGen = await getRecipeGenImage(ctx, recipe.genId);

			return Object.assign(recipe, { imgGen });
		}),
	);

	return recipesWithImg;
}

async function getRecipeGenImage(
	ctx: QueryCtx,
	genId: Id<"recipeGens">,
	shouldThrow = false,
) {
	const recipeGen = await ctx.db.get("recipeGens", genId);

	if (!recipeGen || isSoftDeleted(recipeGen)) {
		if (shouldThrow) {
			throw notFound({ entity: "recipe generation", by: "household" });
		}

		return null;
	}

	if (recipeGen.state.status !== "completed" || !recipeGen.state.imgGenId) {
		return null;
	}

	const imgGen = await nanoBanana.get(ctx, {
		generationId: recipeGen.state.imgGenId,
	});

	if (!imgGen) return null;

	return imgGen;
}

// #endregion
