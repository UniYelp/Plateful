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

export const ALL_QUANTITY = "all";
export type AllQuantity = typeof ALL_QUANTITY;

export const memberRoles = ["manager", "member"] as const;
export type MemberRole = (typeof memberRoles)[number];

// #endregion

// #region types

export type FullTableNames = TableNames | SystemTableNames;

// #endregion

// #region validators

const vSysId = <const SysTableName extends SystemTableNames>(
	tableName: SysTableName,
) => v.id(tableName);

export const vUserStampId = v.union(v.id("users"), v.literal(SYSTEM_ID));
export type UserStampId = Infer<typeof vUserStampId>;

export const vEnum = <const T extends string>(e: readonly T[]) =>
	v.union(...e.map((val) => v.literal(val)));

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

const vImage = vSysId("_storage");

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
	role: vEnum(memberRoles),
	joinedAt: vTimestamp,
};

export const ingredientQuantityFields = {
	amount: v.number(),
	unit: v.optional(v.string()),
};

export const ingredientFields = {
	householdId: v.id("households"),

	name: v.string(),
	description: v.optional(v.string()),

	quantities: v.array(
		v.object({
			...ingredientQuantityFields,
			state: v.optional(v.string()),
			expiresAt: v.optional(vTimestamp),
		}),
	),
	category: v.string(),
	tags: v.array(v.string()), //? system searchable
	notes: v.optional(v.string()), //? user non-searchable

	images: v.array(vImage),

	// variantId: v.optional(v.id("ingredients")), // TODO: might have to split to headless ing & variants tables
};

export const recipeFields = {
	householdId: v.id("households"),

	title: v.string(),
	description: v.optional(v.string()),

	type: v.union(v.literal("simple"), v.literal("advanced")),

	prepTime: v.nullable(vDuration),
	cookTime: v.nullable(vDuration),

	tags: v.array(v.string()), //? system searchable
	keywords: v.array(v.string()), //? user searchable
	notes: v.optional(v.string()), //? user non-searchable
};

export const recipeIngredientFields = {
	recipeId: v.id("recipes"),
	ingredientId: v.id("ingredients"),

	quantity: v.object(ingredientQuantityFields),
	state: v.optional(v.string()),
};

export const recipeStepBlock = v.union(
	v.string(),
	v.object({
		type: v.literal("tool"),
		name: v.string(),
	}),
	v.object({
		type: v.literal("duration"),
		value: vDuration,
		kind: v.union(v.literal("prep"), v.literal("cook")),
	}),
	v.object({
		type: v.literal("temperature"),
		value: v.number(),
		unit: vEnum(temperatureUnits),
	}),
	v.object({
		type: v.literal("material"),
		ingredient: v.union(
			v.object({
				id: v.id("ingredients"), //! lookup recipeIngredient by ingredientId x recipeId | validate uniqueness
			}),
			v.object({
				name: v.string(),
			}),
		),
		quantity: v.union(
			v.object(ingredientQuantityFields),
			v.literal(REMAINING_QUANTITY),
			v.literal(ALL_QUANTITY),
		),
		state: v.optional(v.string()),
		kind: v.union(
			v.literal("input"),
			v.literal("derived-input"),
			v.literal("derived-output"),
			v.literal("output"),
		),
	}),
);

export const recipeStepFields = {
	recipeId: v.id("recipes"),

	index: v.number(),
	blocks: v.array(recipeStepBlock),
};

export const recipeGenV0ParametersFields = {
	version: v.literal("v0"),
	tags: v.array(v.string()),
	ingredients: v.array(v.id("ingredients")),
};

export const recipeGensFields = {
	householdId: v.id("households"),

	metadata: v.union(
		v.object({
			status: v.union(
				v.literal("pending"),
				v.literal("generating"),
				v.literal("failed"),
			),
		}),
		v.object({
			status: v.literal("completed"),
			recipeId: v.id("recipes"),
		}),
	),
	parameters: v.union(v.object(recipeGenV0ParametersFields)),
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
	// #endregion
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
		.index("by_household_deletedAt_name", ["householdId", "deletedAt", "name"])
		.searchIndex("search_ingredients", {
			searchField: "name",
			filterFields: ["householdId", "description", "tags"],
		}),
	recipes: defineTable({
		...recipeFields,
		...stampsFields,
	})
		.index("by_household_deletedAt_title", [
			"householdId",
			"deletedAt",
			"title",
		])
		.searchIndex("search_recipes", {
			searchField: "title",
			filterFields: ["householdId", "description", "tags", "keywords"],
		}),
	recipeIngredients: defineTable({
		...recipeIngredientFields,
		...stampsFields,
	}).index("by_recipe_deletedAt_ingredient", [
		"recipeId",
		"deletedAt",
		"ingredientId",
	]),
	recipeSteps: defineTable({
		...recipeStepFields,
		...stampsFields,
	}).index("by_recipe_and_index", ["recipeId", "index"]),
	recipeGens: defineTable({
		...recipeGensFields,
		...stampsFields,
	}).index("by_household_deletedAt", ["householdId", "deletedAt"]),
	// #endregion
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

export const vDocShape = <TableName extends TableNames>(tableName: TableName) =>
	schema.tables[tableName].validator;

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

export type StampedEntity = Extract<Doc<TableNames>, EntityStamps>;
export type StampedTableNames = StampedEntity["_id"]["__tableName"];

// #endregion

// biome-ignore lint/style/noDefaultExport: external
export default schema;
