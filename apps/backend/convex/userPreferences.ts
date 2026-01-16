import { userPreferencesFields } from "./schema";
import { authedMutation, authedQuery } from "./with_auth";

// #region Queries

export const byActiveUser = authedQuery({
	async handler(ctx) {
		const userPreferences = await ctx.db
			.query("userPreferences")
			.withIndex("by_user_deletedAt", (q) => q.eq("userId", ctx.user._id))
			.unique();

		if (!userPreferences) return null;

		const {
			allergens,
			dietaryPreferences,
			dislikedFoods,
			likedFoods,
			spiceLevel,
		} = userPreferences;

		return {
			allergens,
			dietaryPreferences,
			dislikedFoods,
			likedFoods,
			spiceLevel,
		};
	},
});

// #endregion

// #region Mutations

export const upsert = authedMutation({
	args: {
		...userPreferencesFields,
	},
	async handler(ctx, args) {
		const now = Date.now();

		const userPreferences = await ctx.db
			.query("userPreferences")
			.withIndex("by_user_deletedAt", (q) => q.eq("userId", ctx.user._id))
			.unique();

		const data = {
			userId: ctx.user._id,
			...args,
			deletedAt: undefined,
			updatedAt: now,
		};

		if (userPreferences === null) {
			const userPreferencesId = await ctx.db.insert("userPreferences", data);
			return userPreferencesId;
		}

		const userPreferencesId = await ctx.db.patch(
			"userPreferences",
			userPreferences._id,
			data,
		);

		return userPreferencesId;
	},
});

// #endregion
