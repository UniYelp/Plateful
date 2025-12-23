import {
	customCtx,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions";

import type { Doc } from "./_generated/dataModel";
import {
	internalQuery,
	type MutationCtx,
	type QueryCtx,
	query,
} from "./_generated/server";
import { unauthorized } from "./errors";
import { internalMutation, mutation } from "./functions";

type CtxWithDB = QueryCtx | MutationCtx;

type AuthedCtx<Ctx> = Ctx & {
	user: Doc<"users">;
};

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

export const internalAuthedQuery = customQuery(
	internalQuery,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

export type AuthedQueryCtx = AuthedCtx<QueryCtx>;

// #endregion

// #region Mutations

export const authedMutation = customMutation(
	mutation,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

export const internalAuthedMutation = customMutation(
	internalMutation,
	customCtx(async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		return { user };
	}),
);

export type AuthedMutationCtx = AuthedCtx<MutationCtx>;

// #endregion

// #region Helpers

export async function getCurrentUserOrThrow(ctx: CtxWithDB) {
	const user = await getCurrentUser(ctx);
	if (!user) throw unauthorized();
	return user;
}

export async function getCurrentUser(ctx: CtxWithDB) {
	const identity = await ctx.auth.getUserIdentity();

	if (identity === null) {
		return null;
	}

	return await userByExternalId(ctx, identity.subject);
}

export async function userByExternalId(ctx: CtxWithDB, externalId: string) {
	return await ctx.db
		.query("users")
		.withIndex("byExternalId", (q) => q.eq("externalId", externalId))
		.unique();
}

// #endregion
