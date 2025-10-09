import {
	customCtx,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions";

import { internalQuery, type QueryCtx, query } from "./_generated/server";
import { internalMutation, mutation } from "./functions";
// import { internalQuery } from "./_generated/server";
// import {mutation, internalMutation} from './functions'

/**
 * @file
 * {@link https://stack.convex.dev/custom-functions}
 */

// TODO: wrap authed query & mutation

// #region Queries

export const authedQuery = customQuery(
	query,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

export const authedInternalQuery = customQuery(
	internalQuery,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

// #region Mutations

export const authedMutation = customMutation(
	mutation,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

export const authedInternalMutation = customMutation(
	internalMutation,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

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

export async function userByExternalId(ctx: QueryCtx, externalId: string) {
	return await ctx.db
		.query("users")
		.withIndex("byExternalId", (q) => q.eq("externalId", externalId))
		.unique();
}
