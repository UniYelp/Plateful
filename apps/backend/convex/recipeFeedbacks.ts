import { query } from "./_generated/server";
import { notFound } from "./errors";
import { recipeFeedbackFields } from "./schema";
import { authedMutation, authedQuery } from "./with_auth";

export const submit = authedMutation({
	args: {
		recipeId: recipeFeedbackFields.recipeId,
		value: recipeFeedbackFields.value,
	},
	handler: async (ctx, args) => {
		const { user } = ctx;

		if (!user) {
			throw notFound({
				entity: "user"
			});
		}

		const userHouseholds = await ctx.db.query("householdMembers").withIndex("by_user_deletedAt", (q) => q.eq("userId", user._id)).collect();

		if (userHouseholds.length === 0) {
			throw notFound({
				entity: "household"
			});
		}

		const recipe = await ctx.db.get("recipes", args.recipeId);

		if (!recipe || !userHouseholds.some((membership) => membership.householdId === recipe.householdId)) {
			throw notFound({
				entity: "recipe",
				by: "household"
			});
		}

		const existing = await ctx.db
			.query("recipeFeedbacks")
			.withIndex("by_recipe_and_user", (q) =>
				q.eq("recipeId", args.recipeId).eq("userId", user._id),
			)
			.unique();

		const timestamp = Date.now();

		if (existing) {
			// Update the feedback if the user already submitted one
			await ctx.db.patch("recipeFeedbacks", existing._id, {
				value: args.value,
				updatedAt: timestamp,
				updatedBy: user._id,
			});
			return existing._id;
		}

		// Insert new feedback
		return await ctx.db.insert("recipeFeedbacks", {
			recipeId: args.recipeId,
			userId: user._id,
			value: args.value,
			createdBy: user._id,
			updatedAt: timestamp,
			updatedBy: user._id,
		});
	},
});

export const getByRecipeAndUser = authedQuery({
	args: {
		recipeId: recipeFeedbackFields.recipeId,
	},
	handler: async (ctx, args) => {
		const { user } = ctx;

		if (!user) {
			throw notFound({
				entity: "user"
			});
		}

		const userHouseholds = await ctx.db.query("householdMembers").withIndex("by_user_deletedAt", (q) => q.eq("userId", user._id)).collect();

		if (userHouseholds.length === 0) {
			throw notFound({
				entity: "household"
			});
		}

		const recipe = await ctx.db.get("recipes", args.recipeId);

		if (!recipe || !userHouseholds.some((membership) => membership.householdId === recipe.householdId)) {
			throw notFound({
				entity: "recipe",
				by: "household"
			});
		}

		return await ctx.db
			.query("recipeFeedbacks")
			.withIndex("by_recipe_and_user", (q) =>
				q.eq("recipeId", args.recipeId).eq("userId", user._id),
			)
			.unique();
	},
});
