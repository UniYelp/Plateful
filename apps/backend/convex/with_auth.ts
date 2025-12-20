import {
	customCtx,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions";

import type { Doc } from "./_generated/dataModel";
import { type MutationCtx, type QueryCtx, query } from "./_generated/server";
import { mutation } from "./functions";
// import { internalQuery } from "./_generated/server";
// import {mutation, internalMutation} from './functions'

/**
 * @file
 * {@link https://stack.convex.dev/custom-functions}
 */

// #region Queries

export const authedQuery = customQuery(
	query,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

export type AuthedQueryCtx = QueryCtx & { user: Doc<"users"> };

// #region Mutations

export const authedMutation = customMutation(
	mutation,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

export type AuthedMutationCtx = MutationCtx & { user: Doc<"users"> };

// #region Helpers

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const user = await getCurrentUser(ctx);
	if (!user) throw new Error("Not authenticated");
	return user;
}

export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (identity === null) {
		return null;
	}

	return await userByExternalId(ctx, identity.subject);
}

export async function userByExternalId(ctx: QueryCtx, externalId: string) {
	return await ctx.db
		.query("users")
		.withIndex("byExternalId", (q) => q.eq("externalId", externalId))
		.unique();
}
