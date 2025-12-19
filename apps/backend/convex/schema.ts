import {
	defineSchema,
	defineTable,
	type SystemTableNames,
	type WithoutSystemFields,
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

import { temperatureUnits } from "@plateful/units/temperature";
import type { Doc, TableNames } from "./_generated/dataModel";

// #region constants

export const SYSTEM_ID = "sys";
export type SystemId = typeof SYSTEM_ID;

export const REMAINING_QUANTITY = "remaining";
export type RemainingQuantity = typeof REMAINING_QUANTITY;

export const memberRoles = ["manager", "member"] as const;
export type MemberRole = (typeof memberRoles)[number];

// #endregion

// #region types

export type FullTableNames = TableNames | SystemTableNames;

// #endregion

// #region validators

export const vSysId = <const SysTableName extends SystemTableNames>(
	tableName: SysTableName,
) => v.id(tableName);

const vUserStampId = v.union(v.id("users"), v.literal(SYSTEM_ID));
export type UserStampId = Infer<typeof vUserStampId>;

/**
 * @example
 * Date.now()
 */
const vTimestamp = v.number();
/**
 * @example
 * Date.now()
 */
export type TimeStamp = Infer<typeof vTimestamp>;

/**
 *? ISO-8601 Duration format
 */
const vDuration = v.string();
/**
 *? ISO-8601 Duration format
 */
export type Duration = Infer<typeof vDuration>;

const vImage = v.object({
	src: vSysId("_storage"),
	generated: v.optional(v.boolean()),
});

// #endregion

// #region shapes

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

export type EntityStamps = ObjectType<typeof stampsFields>;

export const userPreferencesFields = {
	userId: v.id("users"),
};

export const householdMemberFields = {
	householdId: v.id("households"),
	userId: v.id("users"),
	role: v.union(...memberRoles.map((role) => v.literal(role))),
	joinedAt: vTimestamp,
};

export const ingredientQuantityFields = {
	amount: v.number(),
	unit: v.optional(v.string()),
	// state: v.optional(v.string()), // TODO: figure out how to add the state in
};

export const ingredientFields = {
	name: v.string(),
	description: v.optional(v.string()),

	quantities: v.array(
		v.object({
			...ingredientQuantityFields,
			state: v.optional(v.string()), //? has no actual usage
			expiresAt: v.optional(vTimestamp),
		}),
	),
	category: v.string(),
	tags: v.array(v.string()), //? system searchable
	notes: v.optional(v.string()), //? user non-searchable

	images: v.array(vImage),

	householdId: v.id("households"),
	// variantId: v.optional(v.id("ingredients")), // TODO: might have to split to headless ing & variants tables
};

export const recipeFields = {
	title: v.string(),
	description: v.optional(v.string()),

	prepTime: v.nullable(vDuration),
	cookTime: v.nullable(vDuration),

	tags: v.array(v.string()), //? system searchable
	keywords: v.array(v.string()), //? user searchable
	notes: v.optional(v.string()), //? user non-searchable

	householdId: v.id("households"),
};

export const ingredientMetadataFields = v
	.object(ingredientFields)
	.pick("name", "description", "tags").fields;

export const recipeGenMetadataFields = {
	state: v.union(
		v.literal("pending"),
		v.literal("generating"),
		v.literal("completed"),
		v.literal("failed"),
	),

	tags: v.array(v.string()),
	ingredients: v.array(
		v.object({
			...ingredientMetadataFields,
			ingredientId: v.nullable(v.id("ingredients")),
		}),
	),

	householdId: v.id("households"),
	recipeId: v.nullable(v.id("recipes")),
};

export const recipeIngredientFields = {
	quantities: v.array(v.object(ingredientQuantityFields)),

	recipeId: v.id("recipes"),
	ingredientId: v.id("ingredients"),
};

export const recipeInstructionPart = v.union(
	v.string(),
	v.object({
		type: v.literal("duration"),
		value: vDuration,
		kind: v.union(v.literal("prep"), v.literal("cook")),
	}),
	v.object({
		type: v.literal("temperature"),
		value: v.number(),
		unit: v.union(...temperatureUnits.map((unit) => v.literal(unit))),
	}),
	v.object({
		type: v.literal("material"),
		...ingredientMetadataFields,
		ingredientId: v.nullable(v.id("ingredients")), //! lookup recipeIngredient by ingredientId x recipeId | validate uniqueness
		quantity: v.union(
			v.object(ingredientQuantityFields),
			v.literal(REMAINING_QUANTITY),
		),
	}),
	v.object({
		type: v.literal("yield"),
		...ingredientMetadataFields,
		ingredientId: v.nullable(v.id("ingredients")),
		quantity: v.object(ingredientQuantityFields),
	}),
);

export const recipeInstructionFields = {
	step: v.number(),
	parts: v.array(recipeInstructionPart),
	notes: v.optional(v.string()),

	recipeId: v.id("recipes"),
};

// #endregion

// #region schema
/**
 * @see {@link https://stack.convex.dev/relationship-structures-let-s-talk-about-schemas}
 * @see {@link https://stack.convex.dev/functional-relationships-helpers}
 */

const schema = defineSchema({
	// #region systemland
	users: defineTable({
		// this the Clerk ID, stored in the subject JWT field
		externalId: v.string(),
		...timestampsFields,
	}).index("byExternalId", ["externalId"]),
	// #region userland
	households: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		...stampsFields,
	}),
	householdMembers: defineTable({
		...householdMemberFields,
		...stampsFields,
	})
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
			filterFields: ["householdId", "description", "tags"],
		}),
	recipes: defineTable({
		...recipeFields,
		...stampsFields,
	})
		.index("by_household", ["householdId"])
		.index("by_household_and_title", ["householdId", "title"])
		.searchIndex("search_recipes", {
			searchField: "title",
			filterFields: ["householdId", "description", "tags", "keywords"],
		}),
	recipeIngredients: defineTable({
		...recipeIngredientFields,
		...stampsFields,
	}).index("by_recipe_and_ingredient", ["recipeId", "ingredientId"]),
	recipeInstructions: defineTable({
		...recipeInstructionFields,
		...stampsFields,
	}).index("by_recipe_and_step", ["recipeId", "step"]),
	recipeGenMetadata: defineTable({
		...recipeGenMetadataFields,
		...stampsFields,
	}).index("by_household", ["householdId"]),
});

// #endregion

// #region utils

/**
 * @description Used to get autocomplete and validation of the `tableName`
 *
 * @note //! DO NOT USE THIS IN THE schema file | It'll break the schema types
 */
export const vId: <const TableName extends FullTableNames>(
	tableName: TableName,
) => VId<GenericId<TableName>> = v.id;

/**
 * @description A {@link v} instance with types based on the {@link schema}
 *
 * @note //! DO NOT USE THIS IN THE schema file | It'll break the schema types
 *
 * @see {@link https://stack.convex.dev/argument-validation-without-repetition}
 * @see {@link https://docs.convex.dev/functions/validation}
 */
export const vv = typedV(schema);

// TODO: make this work
// export const vvv = {
// 	...vv,
// 	entity<TableName extends TableNames>(tableName: TableName) {
// 		return schema.tables[tableName].validator
//         // .omit(
// 		// 	...(Object.keys(stampsFields) as (keyof typeof stampsFields)[]),
// 		// );
// 	},
// };

// export const vDocFields = <TableName extends TableNames>(tableName: TableName) => vv.

/**
 * @note removes the system fields
 *
 * @see {@link https://stack.convex.dev/types-cookbook}
 */
export type DocShape<TableName extends TableNames> = WithoutSystemFields<
	Doc<TableName>
>;

/**
 * @note removes the system fields, and the stamps
 *
 * @see {@link https://stack.convex.dev/types-cookbook}
 */
export type EntityShape<TableName extends TableNames> = Omit<
	DocShape<TableName>,
	keyof EntityStamps
>;

// #endregion

// biome-ignore lint/style/noDefaultExport: external
export default schema;
