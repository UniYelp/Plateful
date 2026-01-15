import {
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions";

import type { Maybe } from "@plateful/types";
import { bool } from "@plateful/utils";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { forbidden, notFound } from "./errors";
import { internalMutation } from "./functions";
import { type EntityShape, type UserStampId, vv } from "./schema";
import { isSoftDeleted, notDeletedIndex } from "./utils/soft_delete";
import {
	type AuthedMutationCtx,
	type AuthedQueryCtx,
	authedMutation,
	authedQuery,
	internalAuthedMutation,
} from "./with_auth";

// #region Validators

const vHousehold = vv.doc("households");
const vHouseholdFields = vHousehold.pick("name", "description");

// #endregion

// #region Wrappers

export const householdQuery = customQuery(authedQuery, {
	args: {
		householdId: vv.id("households"),
	},
	input: async (ctx, args) => {
		const { user } = ctx as AuthedQueryCtx; //? Convex don't propagate the extensions by other extended custom functions
		const { _id: userId } = user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const validateHousehold = getHouseholdEntityValidator(args.householdId);

		return {
			ctx: { user, validateHousehold }, //? Convex don't propagate the extensions by other extended custom functions
			args,
		};
	},
});

export const householdMutation = customMutation(authedMutation, {
	args: {
		householdId: vv.id("households"),
	},
	input: async (ctx, args) => {
		const { user } = ctx as AuthedMutationCtx; //? Convex don't propagate the extensions by other extended custom functions
		const { _id: userId } = user;

		await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

		const validateHousehold = getHouseholdEntityValidator(args.householdId);

		return {
			ctx: { user, validateHousehold }, //? Convex don't propagate the extensions by other extended custom functions
			args,
		};
	},
});

export const internalHouseholdMutation = customMutation(
	internalAuthedMutation,
	{
		args: {
			householdId: vv.id("households"),
		},
		input: async (ctx, args) => {
			const { user } = ctx as AuthedMutationCtx; //? Convex don't propagate the extensions by other extended custom functions
			const { _id: userId } = user;

			await validateUserInHouseholdOrThrow(ctx, userId, args.householdId);

			return {
				ctx: { user }, //? Convex don't propagate the extensions by other extended custom functions
				args,
			};
		},
	},
);

// #endregion

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

		return households.filter(bool);
	},
});

/**
 * ? Temporary
 */
export const currentUserHousehold = authedQuery({
	args: {},
	handler: async (ctx) => {
		const { _id: userId } = ctx.user;

		const memberships = await ctx.db
			.query("householdMembers")
			.withIndex("by_user_deletedAt", (q) =>
				q.eq("userId", userId).eq(...notDeletedIndex),
			)
			.take(1);

		const membership = memberships.at(0);

		if (!membership || isSoftDeleted(membership)) {
			throw notFound({
				entity: "membership",
				by: "user",
			});
		}

		const household = await ctx.db.get("households", membership.householdId);

		if (!household || isSoftDeleted(household)) {
			throw notFound({
				entity: "household",
				by: "user",
			});
		}

		return household;
	},
});

export const getHouseholdMembers = householdQuery({
	args: {},
	handler: async (ctx, args) => {
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

// #endregion

// #region Helpers

export async function getUserMemberships(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
) {
	return await ctx.db
		.query("householdMembers")
		.withIndex("by_user_deletedAt", (q) =>
			q.eq("userId", userId).eq(...notDeletedIndex),
		)
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
		throw forbidden(
			`User with ID ${userId} is not a member of household with ID ${householdId}.`,
		);
	}
}

/**
 * @throws
 */
export function validateHouseholdEntity<
	T extends { householdId: Id<"households"> },
>(entity: T, householdId: Id<"households">) {
	if (entity.householdId === householdId) return;

	throw forbidden();
}

function getHouseholdEntityValidator(householdId: Id<"households">) {
	/**
	 * @description if the entity is defined, validates that the entity's household matches
	 * @throws
	 */
	return <T extends { householdId: Id<"households"> }>(entity?: Maybe<T>) => {
		if (!entity) return;
		validateHouseholdEntity(entity, householdId);
	};
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

// #endregion
