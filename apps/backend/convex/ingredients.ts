import { EXPIRING_SOON_TIME_WINDOW_MS } from "@plateful/ingredients";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { validateUserInHouseholdOrThrow } from "./households";
import { ingredientFields, vv } from "./schema";
import { authedMutation, authedQuery } from "./with_auth";

// #region Validators

// #region Queries

export const householdIngredients = authedQuery({
	args: {
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		return await getHouseholdIngredients(ctx, args.householdId);
	},
});

export const ingredientsCount = authedQuery({
	args: {
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const ingredients = await getHouseholdIngredients(ctx, args.householdId);

		return ingredients.length;
	},
});

export const expiringSoonIngredients = authedQuery({
	args: {
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

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
export const addIngredient = authedMutation({
	args: ingredientFields,
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const now = Date.now();

		ctx.db.insert("ingredients", {
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
	},
});

export const deleteIngredient = authedMutation({
	args: {
		ingredientId: vv.id("ingredients"),
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

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
// #engregion
