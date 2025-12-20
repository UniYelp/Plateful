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

    const memberIds = members.map((member) => member.userId);

    const memberExternalIds = await ctx.runQuery(internal.users.externalUserIdListByUserIds, {
      userIds: memberIds,
    });

    const externalIdByUserId = Object.fromEntries(
      memberExternalIds.map(({ externalId, userId }) => [
        userId,
        {
          externalId: externalId,
        },
      ]),
    );

    const memberDetails = members.map((member) => ({
      ...member,
      externalId: externalIdByUserId[member.userId].externalId,
    }));

    const memberDetailsByExternalId: Record<string, { id: Id<"users">; role: MemberRole }> =
      Object.fromEntries(
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
