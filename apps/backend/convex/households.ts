import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation } from "./functions";
import { type EntityShape, type UserStampId, vv } from "./schema";
import { authedMutation, authedQuery } from "./with_auth";

// #region Validators

const vHousehold = vv.doc("households");
const vHouseholdFields = vHousehold.pick("name", "description");

// #region Queries
export const getUserHouseholds = authedQuery({
	args: {},
	handler: async (ctx) => {
		const { _id: userId } = ctx.user;
		const memberships = await getUserMemberships(ctx, userId);

		const households = await Promise.all(
			memberships.map(async (membership) => {
				const household = await ctx.db.get(
					"households",
					membership.householdId,
				);

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

export const getHouseholdMembers = authedQuery({
	args: { householdId: vv.id("households") },
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		// Check if user is member of this household
		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const members = await ctx.db
			.query("householdMembers")
			.withIndex("by_household_and_user", (q) =>
				q.eq("householdId", args.householdId),
			)
			.collect();

		return members;
	},
});

// #region Mutations
export const createHousehold = authedMutation({
	args: vHouseholdFields,
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		const householdId = await createUserHousehold({
			ctx,
			userId,
			household: args,
		});

		return householdId;
	},
});

export const deleteHouseholds = internalMutation({
	args: {
		userId: vv.id("users"),
	},
	handler: async (ctx, args) => {
		const memberships = await getUserMemberships(ctx, args.userId);

		for (const membership of memberships) {
			await ctx.db.delete("households", membership.householdId);
		}
	},
});

export const deleteVacantHouseholds = internalMutation({
	args: {},
	handler: async (_ctx) => {
		// for (const membership of await ctx.db.query()) {
		// 	await ctx.db.delete(membership.householdId);
		// }
	},
});

// #region Helpers
export async function getUserMemberships(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
) {
	return await ctx.db
		.query("householdMembers")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.collect();
}

export async function validateUserInHouseholdOrThrow(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
	householdId: Id<"households">,
) {
	const membership = await ctx.db
		.query("householdMembers")
		.withIndex("by_household_and_user", (q) =>
			q.eq("householdId", householdId).eq("userId", userId),
		)
		.unique();

	if (!membership) {
		throw new Error(
			`User with ID ${userId} is not a member of household with ID ${householdId}.`,
		);
	}
}

export async function createUserHousehold({
	ctx,
	userId,
	household,
	createdBy = userId,
}: {
	ctx: MutationCtx;
	userId: Id<"users">;
	household: EntityShape<"households">;
	createdBy?: UserStampId;
}) {
	const now = Date.now();

	const householdId = await ctx.db.insert("households", {
		name: household.name,
		description: household.description,
		createdBy,
		updatedBy: createdBy,
		updatedAt: now,
	});

	await ctx.db.insert("householdMembers", {
		householdId,
		userId,
		role: "manager",
		joinedAt: now,
		createdBy,
		updatedBy: createdBy,
		updatedAt: now,
	});

	return householdId;
}
