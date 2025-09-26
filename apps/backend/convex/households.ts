import { v } from "convex/values";
import type { Id } from "./_generated/dataModel.d";
import { type MutationCtx, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server.d";
import { internalMutation, mutation } from "./functions";
import { getCurrentUserOrThrow } from "./users";

// #region Queries
export const getUserHouseholds = query({
	args: {},
	handler: async (ctx) => {
		const { _id: userId } = await getCurrentUserOrThrow(ctx);
		const memberships = await getUserMemberships(ctx, userId);

		const households = await Promise.all(
			memberships.map(async (membership) => {
				const household = await ctx.db.get(membership.householdId);
				if (!household) return;

				return {
					...household,
					role: membership.role,
					joinedAt: membership.joinedAt,
				};
			}),
		);

		return households.filter(Boolean);
	},
});

export const getHouseholdMembers = query({
	args: { householdId: v.id("households") },
	handler: async (ctx, args) => {
		const { _id: userId } = await getCurrentUserOrThrow(ctx);

		// Check if user is member of this household
		const membership = await ctx.db
			.query("householdMembers")
			.withIndex("by_household_and_user", (q) =>
				q.eq("householdId", args.householdId).eq("userId", userId),
			)
			.unique();

		if (!membership) {
			throw new Error("Not a member of this household");
		}

		const members = await ctx.db
			.query("householdMembers")
			.withIndex("by_household", (q) => q.eq("householdId", args.householdId))
			.collect();

		return members;
	},
});

// #region Mutations
export const createHousehold = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = await getCurrentUserOrThrow(ctx);
		const householdId = await createUserHousehold(ctx, userId, args);
		return householdId;
	},
});

export const deleteHouseholds = internalMutation({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const memberships = await getUserMemberships(ctx, args.userId);

		for (const membership of memberships) {
			await ctx.db.delete(membership.householdId);
		}
	},
});

export const deleteVacantHouseholds = internalMutation({
	handler: async (_ctx) => {
		// for (const membership of await ctx.db.query()) {
		// 	await ctx.db.delete(membership.householdId);
		// }
	},
});

// #region Helpers
async function getUserMemberships(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
) {
	return await ctx.db
		.query("householdMembers")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.collect();
}

export async function createUserHousehold(
	ctx: MutationCtx,
	userId: Id<"users">,
	household: { name: string; description?: string },
) {
	const now = Date.now();

	const householdId = await ctx.db.insert("households", {
		name: household.name,
		description: household.description,
		createdBy: userId,
		updatedAt: now,
	});

	await ctx.db.insert("householdMembers", {
		householdId,
		userId,
		role: "manager",
		joinedAt: now,
		updatedAt: now,
	});

	return householdId;
}
