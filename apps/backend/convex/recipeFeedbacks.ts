import { notFound } from "./errors";
import { householdMutation, householdQuery } from "./households";
import { recipeFeedbackFields } from "./schema";
import { isSoftDeleted } from "./utils/soft_delete";
export const submit = householdMutation({
	args: {
		recipeId: recipeFeedbackFields.recipeId,
		value: recipeFeedbackFields.value,
	},
	handler: async (ctx, args) => {
		const { user } = ctx;

		const recipe = await ctx.db.get("recipes", args.recipeId);

		if (!recipe || isSoftDeleted(recipe) || !ctx.isHousehold(recipe)) {
			throw notFound({
				entity: "recipe",
				by: "household",
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

export const getByRecipeAndUser = householdQuery({
	args: {
		recipeId: recipeFeedbackFields.recipeId,
	},
	handler: async (ctx, args) => {
		const { user } = ctx;

		const recipe = await ctx.db.get("recipes", args.recipeId);

		if (!recipe || isSoftDeleted(recipe) || !ctx.isHousehold(recipe)) {
			throw notFound({
				entity: "recipe",
				by: "household",
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
