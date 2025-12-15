import { createClerkClient, type User } from "@clerk/backend";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { vv } from "./schema";

// The key is loaded securely from environment variables
const clerk = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
});

async function fetchUserData(userId: string) {
	try {
		const user: User = await clerk.users.getUser(userId);

		return {
			fullName: user.fullName,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.primaryEmailAddress?.emailAddress,
		};
	} catch (error) {
		console.error(`Error fetching user ${userId}:`, error);
	}
}

export const getUserData = action({
	args: {
		userId: vv.id("users"),
	},
	handler: async (ctx, args) => {
		const externalId = await ctx.runQuery(
			internal.users.getExternalUserIdByUserId,
			{ userId: args.userId },
		);

		if (!externalId) return null;

		const clerkUser = await fetchUserData(externalId);
		return clerkUser;
	},
});
