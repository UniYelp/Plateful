import { api } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

export async function getActionCurrentUserOrThrow(ctx: ActionCtx) {
	const user = await ctx.runQuery(api.users.current);
	if (!user) throw new Error("Not authenticated");
	return user;
}
