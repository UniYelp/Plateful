import { createClerkClient } from "@clerk/backend";

import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { type MemberRole, vv } from "./schema";

const clerk = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
});

export const getHouseholdMembersData = action({
	args: {
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const members = await ctx.runQuery(api.households.getHouseholdMembers, {
			householdId: args.householdId,
		});

		const memberDetails = await Promise.all(
			members.map(async (member) => ({
				...member,
				externalId: await ctx.runQuery(
					internal.users.getExternalUserIdByUserId,
					{
						userId: member.userId,
					},
				),
			})),
		);

		const memberDetailsByExternalId: Record<
			string,
			{ id: Id<"users">; role: MemberRole }
		> = Object.fromEntries(
			memberDetails.map(({ externalId, userId, role }) => [
				externalId,
				{
					id: userId,
					role,
				},
			]),
		);

		const userDetail = await clerk.users.getUserList({
			userId: Object.keys(memberDetailsByExternalId),
		});

		const mergedData = userDetail.data.map((user) => {
			const memberDetails = memberDetailsByExternalId[user.id];

			return {
				...memberDetails,
				fullName: user.fullName,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.primaryEmailAddress?.emailAddress,
			};
		});

		return mergedData;
	},
});

// helpers
