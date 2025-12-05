import type { UserJSON } from "@clerk/backend";
import type { Validator } from "convex/values";

import { query } from "./_generated/server";
import { internalMutation } from "./functions";
import { createUserHousehold } from "./households";
import { type DocShape, SYSTEM_ID, vv } from "./schema";
import { getCurrentUser, userByExternalId } from "./with_auth";

// #region Queries
export const current = query({
	args: {},
	handler: async (ctx) => {
		return await getCurrentUser(ctx);
	},
});

// #region Mutations
export const upsertFromClerk = internalMutation({
	args: { data: vv.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
	async handler(ctx, { data }) {
		const now = Date.now();

		const userAttributes = {
			externalId: data.id,
			updatedAt: now,
		} satisfies DocShape<"users">;

		const user = await userByExternalId(ctx, data.id);

		if (user === null) {
			const userId = await ctx.db.insert("users", userAttributes);

			await createUserHousehold({
				ctx,
				userId,
				household: {
					name: "My Household",
				},
				createdBy: SYSTEM_ID,
			});
		} else {
			await ctx.db.patch(user._id, userAttributes);
		}
	},
});

export const deleteFromClerk = internalMutation({
	args: { clerkUserId: vv.string() },
	async handler(ctx, { clerkUserId }) {
		const user = await userByExternalId(ctx, clerkUserId);

		if (user !== null) {
			const now = Date.now();

			await ctx.db.patch(user._id, {
				updatedAt: now,
				deletedAt: now,
			});
		} else {
			console.warn(
				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
			);
		}
	},
});

// #region Helpers
