import type { QueryCtx } from "./_generated/server";
// import { query, internalQuery } from "./_generated/server";
// import {mutation, internalMutation} from './functions'

// TODO: wrap authed query & mutation

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
