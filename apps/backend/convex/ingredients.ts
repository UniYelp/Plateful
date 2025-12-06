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

		return await ctx.db
			.query("ingredients")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();
	},
});

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
            tags: args.tags,
			householdId: args.householdId,
			createdBy: userId,
			updatedBy: userId,
			updatedAt: now,
		});
	},
});
