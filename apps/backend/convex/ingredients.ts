import { v } from "convex/values";

import { query } from "./_generated/server";
import { mutation } from "./functions";
import { validateUserInHouseholdOrThrow } from "./households";
import { vIngredient } from "./schema";
import { getCurrentUserOrThrow } from "./users";

// #region Queries
export const householdIngredients = query({
	args: {
		householdId: v.id("households"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = await getCurrentUserOrThrow(ctx);
		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		return await ctx.db
			.query("ingredients")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();
	},
});

// #region Mutations
export const addIngredient = mutation({
	args: vIngredient,
	handler: async (ctx, args) => {
		const { _id: userId } = await getCurrentUserOrThrow(ctx);
		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const now = Date.now();

		ctx.db.insert("ingredients", {
			name: args.name,
			description: args.description,
			amount: args.amount,
			image: args.image,
			categories: args.categories,
			householdId: args.householdId,
			expiredAt: args.expiredAt,
			createdBy: userId,
			updatedBy: userId,
			updatedAt: now,
		});
	},
});
