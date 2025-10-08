import { defineSchema, defineTable } from "convex/server";
import {
	// biome-ignore lint/style/noRestrictedImports: allowed for schema initialization
	v,
} from "convex/values";

export default defineSchema({
	users: defineTable({
		// this the Clerk ID, stored in the subject JWT field
		externalId: v.string(),
	}).index("byExternalId", ["externalId"]),
	households: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		createdBy: v.id("users"),
		updatedAt: v.number(),
	}),
	householdMembers: defineTable({
		householdId: v.id("households"),
		userId: v.id("users"),
		role: v.union(v.literal("manager"), v.literal("member")),
		joinedAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_household", ["householdId"])
		.index("by_user", ["userId"])
		.index("by_household_and_user", ["householdId", "userId"]),
});
