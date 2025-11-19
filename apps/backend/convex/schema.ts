import {
	defineSchema,
	defineTable,
	type SystemTableNames,
} from "convex/server";
import {
	type GenericId,
	type Infer,
	type ObjectType,
	type VId,
	// biome-ignore lint/style/noRestrictedImports: used for schema values
	v,
} from "convex/values";
import { typedV } from "convex-helpers/validators";

import type { TableNames } from "./_generated/dataModel";

export const SYSTEM_ID = "sys";

const vUserStampId = v.union(v.id("users"), v.literal(SYSTEM_ID));

export type UserStampId = Infer<typeof vUserStampId>;

const vTimestamp = v.number();

const userStampsFields = {
	createdBy: vUserStampId,
	updatedBy: vUserStampId,
};

const timestampsFields = {
	updatedAt: vTimestamp,
	deletedAt: v.optional(vTimestamp),
};

const stampsFields = {
	...userStampsFields,
	...timestampsFields,
};

export const householdFields = {
	name: v.string(),
	description: v.optional(v.string()),
};

export type HouseholdFields = ObjectType<typeof householdFields>;

export const householdMemberFields = {
	householdId: v.id("households"),
	userId: v.id("users"),
	role: v.union(v.literal("manager"), v.literal("member")),
	joinedAt: vTimestamp,
};

export const ingredientFields = {
	name: v.string(),
	description: v.string(),
	amount: v.string(),
	image: v.id("_storage"),
	categories: v.array(v.string()),
	householdId: v.id("households"),
	expiredAt: vTimestamp,
};

const schema = defineSchema({
	// #region systemland
	users: defineTable({
		// this the Clerk ID, stored in the subject JWT field
		externalId: v.string(),
	}).index("byExternalId", ["externalId"]),
	// #region userland
	households: defineTable({
		...householdFields,
		...stampsFields,
	}),
	householdMembers: defineTable({
		...householdMemberFields,
		...stampsFields,
	})
		.index("by_household", ["householdId"])
		.index("by_user", ["userId"])
		.index("by_household_and_user", ["householdId", "userId"]),
	ingredients: defineTable({
		...ingredientFields,
		...stampsFields,
	})
		.index("by_household", ["householdId"])
		.index("by_household_and_title", ["householdId", "name"])
		.searchIndex("search_ingredients", {
			searchField: "name",
			filterFields: ["householdId", "categories"],
		}),
});

/**
 * @description Used to get autocomplete and validation of the `tableName`
 *
 * @note //! DO NOT USE THIS IN THE schema file | It'll break the schema types
 */
export const vId: <const TableName extends TableNames | SystemTableNames>(
	tableName: TableName,
) => VId<GenericId<TableName>> = v.id;

/**
 * @description A {@link v} instance with types based on the {@link schema}
 *
 * {@link https://stack.convex.dev/argument-validation-without-repetition}
 *
 * @note //! DO NOT USE THIS IN THE schema file | It'll break the schema types
 */
export const vv = typedV(schema);

// biome-ignore lint/style/noDefaultExport: external
export default schema;
