import { EXPIRING_SOON_TIME_WINDOW_MS } from "@plateful/ingredients";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { householdMutation, householdQuery } from "./households";
import { ingredientFields, vv } from "./schema";
// #region Validators

// #region Queries

export const byHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const ingredients = await getHouseholdIngredients(ctx, args.householdId);
		return ingredients;
	},
});

export const ingredientsCount = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const ingredients = await getHouseholdIngredients(ctx, args.householdId);
		return ingredients.length;
	},
});

export const expiringSoonIngredients = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const ingredients = await getHouseholdIngredients(ctx, args.householdId);

		const expiryWindow = Date.now() + EXPIRING_SOON_TIME_WINDOW_MS;

		const expiringSoonIngredients = ingredients.filter((ingredient) => {
			return ingredient.quantities.some(
				(quantity) => quantity.expiresAt && quantity.expiresAt <= expiryWindow,
			);
		});

		return expiringSoonIngredients;
	},
});

// #endregion

// #region Mutations
export const add = householdMutation({
	args: ingredientFields,
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		const now = Date.now();

		const ingredientId = await ctx.db.insert("ingredients", {
			name: args.name,
			description: args.description,
			images: args.images,
			quantities: args.quantities,
			category: args.category,
			tags: args.tags,
			householdId: args.householdId,
			createdBy: userId,
			updatedBy: userId,
			updatedAt: now,
		});

		return ingredientId;
	},
});

export const deleteIngredient = householdMutation({
	args: {
		ingredientId: vv.id("ingredients"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		const ingredient = await ctx.db.get("ingredients", args.ingredientId);

		if (!ingredient) {
			throw new Error("Ingredient Not Found");
		}

		if (ingredient.householdId !== args.householdId) {
			throw new Error(
				`Ingredient ${args.ingredientId} not in household ${args.householdId}`,
			);
		}

		const now = Date.now();
		await ctx.db.patch("ingredients", args.ingredientId, {
			updatedBy: userId,
			deletedAt: now,
		});
	},
});

// #endregion

// #region helpers
const getHouseholdIngredients = async (
	ctx: QueryCtx,
	householdId: Doc<"households">["_id"],
) => {
	return await ctx.db
		.query("ingredients")
		.withIndex("by_household_deletedAt_name", (q) =>
			q.eq("householdId", householdId).eq("deletedAt", undefined),
		)
		.collect();
};
// #endregion
