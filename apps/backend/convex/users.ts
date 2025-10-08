import type { UserJSON } from "@clerk/backend";
import type { Validator } from "convex/values";

import { type QueryCtx, query } from "./_generated/server";
import { internalMutation } from "./functions";
import { createUserHousehold } from "./households";
import { v } from "./variables";

// #region Queries
export const current = query({
	args: {},
	handler: async (ctx) => {
		return await getCurrentUser(ctx);
	},
});

// #region Mutations
export const upsertFromClerk = internalMutation({
	args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
	async handler(ctx, { data }) {
		const userAttributes = {
			externalId: data.id,
		};

		const user = await userByExternalId(ctx, data.id);

		if (user === null) {
			const userId = await ctx.db.insert("users", userAttributes);
			await createUserHousehold(ctx, userId, {
				name: "My Household",
			});
		} else {
			await ctx.db.patch(user._id, userAttributes);
		}
	},
});

export const deleteFromClerk = internalMutation({
	args: { clerkUserId: v.string() },
	async handler(ctx, { clerkUserId }) {
		const user = await userByExternalId(ctx, clerkUserId);

		if (user !== null) {
			await ctx.db.delete(user._id);
		} else {
			console.warn(
				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
			);
		}
	},
});

// #region Helpers
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const userRecord = await getCurrentUser(ctx);
	if (!userRecord) throw new Error("Not authenticated");
	return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (identity === null) {
		return null;
	}

	return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
	return await ctx.db
		.query("users")
		.withIndex("byExternalId", (q) => q.eq("externalId", externalId))
		.unique();
}
