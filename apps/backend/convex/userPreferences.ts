import { userPreferencesFields } from "./schema";
import { isSoftDeleted } from "./utils/soft_delete";
import { authedMutation, authedQuery } from "./with_auth";

// #region Queries

export const byActiveUser = authedQuery({
	async handler(ctx) {
		const userPreferences = await ctx.db
			.query("userPreferences")
			.withIndex("by_user_deletedAt", (q) => q.eq("userId", ctx.user._id))
			.unique();

		if (!userPreferences || isSoftDeleted(userPreferences)) return null;

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

export const exists = authedQuery({
	async handler(ctx) {
		const userPreferences = await ctx.db
			.query("userPreferences")
			.withIndex("by_user_deletedAt", (q) => q.eq("userId", ctx.user._id))
			.unique();

		return !(!userPreferences || isSoftDeleted(userPreferences));
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

		const { spiceLevel, dietaryPreferences, likedFoods, dislikedFoods, allergens} = args;

		const data = {
			userId: ctx.user._id,
			spiceLevel: spiceLevel || undefined,
			dietaryPreferences: dietaryPreferences || undefined,
			likedFoods: likedFoods || undefined,
			dislikedFoods: dislikedFoods || undefined, 
			allergens: allergens || undefined,
			deletedAt: undefined,
			updatedAt: now,
		};

		if (userPreferences === null) {
			const userPreferencesId = await ctx.db.insert("userPreferences", data);
			return userPreferencesId;
		}

		await ctx.db.patch("userPreferences", userPreferences._id, data);
	},
});

// #endregion
