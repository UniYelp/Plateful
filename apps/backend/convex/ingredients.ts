import { EXPIRING_SOON_TIME_WINDOW_MS } from "@plateful/ingredients";
import {
	getUserMemberships,
	validateUserInHouseholdOrThrow,
} from "./households";
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

		return await ctx.db
			.query("ingredients")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();
	},
});

export const getIngredientsCount = authedQuery({
	args: {
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const ingredients = await ctx.db
			.query("ingredients")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		return ingredients.length;
	},
});

export const getExpiringSoonIngredients = authedQuery({
	args: {
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const ingredients = await ctx.db
			.query("ingredients")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

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
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		const ingredient = await ctx.db.get(args.ingredientId);
		const userHouseholds = await getUserMemberships(ctx, userId);

		const isIngredientInUsersHouseholds = userHouseholds.some(
			({ householdId }) => householdId === ingredient?.householdId,
		);

		if (isIngredientInUsersHouseholds) {
			ctx.db.delete(args.ingredientId);
		} else {
			throw new Error(
				`Permission Denied: user ${userId} cannot delete ingredient ${args.ingredientId}`,
			);
		}
	},
});

// #endregion
