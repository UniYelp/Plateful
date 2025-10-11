import { defineSchema, defineTable } from "convex/server";
import {
	// biome-ignore lint/style/noRestrictedImports: allowed for schema initialization
	v,
} from "convex/values";

// export const IngredientCategory = v.union(
// 	v.literal("fruit"),
// 	v.literal("dairy"),
// );

const vUserStampId = v.union(v.id("users"), v.literal("system"));

const vUserStamp = {
	createdBy: vUserStampId,
	updatedBy: vUserStampId,
};

const vTimestamps = {
	updatedAt: v.number(),
	deletedAt: v.optional(v.number()),
};

export const vIngredient = {
	name: v.string(),
	description: v.string(),
	amount: v.string(),
	image: v.id("_storage"),
	categories: v.array(v.string()),
	householdId: v.id("households"),
	expiredAt: v.number(),
};

export default defineSchema({
	users: defineTable({
		// this the Clerk ID, stored in the subject JWT field
		externalId: v.string(),
	}).index("byExternalId", ["externalId"]),
	households: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		...vUserStamp,
		...vTimestamps,
	}),
	householdMembers: defineTable({
		householdId: v.id("households"),
		userId: v.id("users"),
		role: v.union(v.literal("manager"), v.literal("member")),
		joinedAt: v.number(),
		...vTimestamps,
	})
		.index("by_household", ["householdId"])
		.index("by_user", ["userId"])
		.index("by_household_and_user", ["householdId", "userId"]),
	ingredients: defineTable({
		...vIngredient,
		...vUserStamp,
		...vTimestamps,
	})
		.index("by_household", ["householdId"])
		.index("by_household_and_title", ["householdId", "name"])
		.searchIndex("search_ingredients", {
			searchField: "name",
			filterFields: ["householdId", "categories"],
		}),
});

// export type IngredientCategory = Infer<typeof IngredientCategory>;

// export const IngredientCategoryEnum = {
// 	DAIRY: 'dairy',
// 	FRUIT: 'fruit'
// } as const satisfies {
// 	[K in IngredientCategory as Uppercase<K>]: K
// }
