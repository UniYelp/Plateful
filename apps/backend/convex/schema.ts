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

import {
	MaterialBlockKindsValues,
	RecipeStepBlockType,
	recipeDurationKinds,
	recipeStepPriorities,
} from "@plateful/recipes";
import { temperatureUnits } from "@plateful/units/temperature";
import type { Doc, TableNames } from "./_generated/dataModel";
import {
	ALL_QUANTITY,
	memberRoles,
	REMAINING_QUANTITY,
	SYSTEM_ID,
} from "./values";

// #region types

export type FullTableNames = TableNames | SystemTableNames;

// #endregion

// #region validators

const vSysId = <const SysTableName extends SystemTableNames>(
	tableName: SysTableName,
) => v.id(tableName);

const vUserStampId = v.union(v.id("users"), v.literal(SYSTEM_ID));
export type UserStampId = Infer<typeof vUserStampId>;

const vEnum = <const T extends string>(e: readonly T[]) =>
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

const vAsset = vSysId("_storage");

// #endregion

// #region shapes

const userStampsFields = {
	createdBy: vUserStampId,
	updatedBy: vUserStampId,
};

export type EntityUserStamps = ObjectType<typeof userStampsFields>;

const timestampsFields = {
	updatedAt: vTimestamp,
	deletedAt: v.optional(vTimestamp),
};

export type EntityTimeStamps = ObjectType<typeof timestampsFields>;

const stampsFields = {
	...userStampsFields,
	...timestampsFields,
};

export type EntityStamps = ObjectType<typeof stampsFields>;

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

export type IngredientQuantity = ObjectType<typeof ingredientQuantityFields>;

export const ingredientFields = {
	householdId: v.id("households"),

	name: v.string(),
	description: v.optional(v.string()),

	quantities: v.array(
		v.object({
			...ingredientQuantityFields,
			// state: v.optional(v.string()),
			expiresAt: v.optional(vTimestamp),
		}),
	),
	category: v.string(),
	tags: v.array(v.string()), //? system searchable
	notes: v.optional(v.string()), //? user non-searchable

	images: v.array(vAsset),
	lastNotifiedExpiryAt: v.optional(vTimestamp),
};

export const recipeFields = {
	householdId: v.id("households"),

	title: v.string(),
	description: v.optional(v.string()),

	type: vEnum(["simple", "advanced"]),

	prepTime: v.nullable(vDuration),
	cookTime: v.nullable(vDuration),

	tags: v.array(v.string()), //? system searchable
	keywords: v.array(v.string()), //? user searchable
	notes: v.optional(v.string()), //? user non-searchable

	genId: v.optional(v.id("recipeGens")),
};

export const recipeIngredientFields = {
	recipeId: v.id("recipes"),
	ingredientId: v.id("ingredients"),

	quantities: v.array(
		v.object({
			...ingredientQuantityFields,
			// state: v.optional(v.string()),
		}),
	),
};

export const vRecipeMaterial = v.union(
	v.object({
		id: v.id("ingredients"), //! lookup recipeIngredient by ingredientId x recipeId | validate uniqueness
	}),
	v.object({
		name: v.string(),
	}),
);

export const vRecipeMaterialQuantity = v.union(
	v.object(ingredientQuantityFields),
	v.literal(REMAINING_QUANTITY),
	v.literal(ALL_QUANTITY),
);

export const recipeStepBlock = v.union(
	v.object({
		type: v.literal(RecipeStepBlockType.Text),
		text: v.string(),
	}),
	v.object({
		type: v.literal("action"),
		action: v.string(),
	}),
	v.object({
		type: v.literal(RecipeStepBlockType.Tool),
		name: v.string(),
	}),
	v.object({
		type: v.literal(RecipeStepBlockType.Duration),
		kind: vEnum(recipeDurationKinds),
		value: vDuration,
	}),
	v.object({
		type: v.literal(RecipeStepBlockType.Temperature),
		value: v.number(),
		unit: vEnum(temperatureUnits),
	}),
	v.object({
		type: v.literal(RecipeStepBlockType.Material),
		kind: vEnum(MaterialBlockKindsValues),
		ingredient: vRecipeMaterial,
		quantity: vRecipeMaterialQuantity,
		// state: v.optional(v.string()),
	}),
);

export const recipeMaterialWasteFields = {
	of: vRecipeMaterial,
	quantity: v.object(ingredientQuantityFields),
};

export const recipeStepMetadataFields = {
	priority: vEnum(recipeStepPriorities),
	// level: vEnum(["beginner", "intermediate", "advanced"]),
	setupTime: v.optional(vDuration),
	waste: v.optional(v.array(v.object(recipeMaterialWasteFields))),
	derivedOutputs: v.optional(
		v.array(
			v.object({
				of: vRecipeMaterial,
				quantity: vRecipeMaterialQuantity,
			}),
		),
	),
};

export type RecipeStepMetadata = ObjectType<typeof recipeStepMetadataFields>;

export const recipeStepFields = {
	recipeId: v.id("recipes"),

	index: v.number(),
	blocks: v.array(recipeStepBlock),
	metadata: v.optional(v.object(recipeStepMetadataFields)),
};

export type RecipeStep = ObjectType<typeof recipeStepFields>;

export const recipeGenV0MetadataFields = {
	version: v.literal("v0"),
	tags: v.array(v.string()),
	ingredients: v.array(v.id("ingredients")),
	tools: v.optional(v.array(v.string())),
	allergens: v.optional(v.array(v.string())),
	dietaryPreferences: v.optional(v.array(v.string())),
	likedFoods: v.optional(v.string()),
	dislikedFoods: v.optional(v.string()),
	userRequest: v.optional(v.string()),
};

export const recipeGensFields = {
	householdId: v.id("households"),

	state: v.union(
		v.object({
			status: vEnum(["pending", "generating", "validating"]),
		}),
		v.object({
			status: v.literal("completed"),
			recipeId: v.id("recipes"),
			imgGenId: v.optional(v.string()),
		}),
		v.object({
			status: v.literal("failed"),
			reason: v.nullable(v.string()),
		}),
	),

	metadata: v.union(v.object(recipeGenV0MetadataFields)),
};

export const recipeFeedbackFields = {
	recipeId: v.id("recipes"),
	userId: v.id("users"),
	value: vEnum(["positive", "negative"]),
};

export const userPreferencesFields = {
	allergens: v.array(v.string()),
	dietaryPreferences: v.array(v.string()),
	spiceLevel: v.optional(v.nullable(v.string())),
	likedFoods: v.optional(v.nullable(v.string())),
	dislikedFoods: v.optional(v.nullable(v.string())),
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
	userPreferences: defineTable({
		userId: v.id("users"),
		...userPreferencesFields,
		...timestampsFields,
	}).index("by_user_deletedAt", ["userId", "deletedAt"]),
	households: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		...stampsFields,
	}),
	householdMembers: defineTable({
		...householdMemberFields,
		...stampsFields,
	})
		.index("by_user_deletedAt", ["userId", "deletedAt"])
		.index("by_household_and_user", ["householdId", "userId"]),
	ingredients: defineTable({
		...ingredientFields,
		...stampsFields,
	})
		.index("by_household_deletedAt_name", ["householdId", "deletedAt", "name"])
		.searchIndex("search_ingredients", {
			searchField: "name",
			filterFields: ["householdId", "description", "tags", "deletedAt"],
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
	})
		.index("by_recipe_deletedAt_ingredient", [
			"recipeId",
			"deletedAt",
			"ingredientId",
		])
		.index("by_ingredient_deletedAt_recipe", [
			"ingredientId",
			"deletedAt",
			"recipeId",
		]),
	recipeSteps: defineTable({
		...recipeStepFields,
		...stampsFields,
	}).index("by_recipe_and_index", ["recipeId", "index"]),
	recipeGens: defineTable({
		...recipeGensFields,
		...stampsFields,
	}).index("by_household_deletedAt", ["householdId", "deletedAt"]),
	recipeFeedbacks: defineTable({
		...recipeFeedbackFields,
		...stampsFields,
	}).index("by_recipe_and_user", ["recipeId", "userId"]),
	pushSubscriptions: defineTable({
		userId: v.id("users"),
		endpoint: v.string(),
		keys: v.object({
			p256dh: v.string(),
			auth: v.string(),
		}),
		...timestampsFields,
	})
		.index("by_user", ["userId"])
		.index("by_endpoint", ["endpoint"]),
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

export const vvv = {
	timestamp: () => vTimestamp,
	duration: () => vDuration,
	userStamp: () => vUserStampId,
	asset: () => vAsset,
	enum: vEnum,
	docShape: <TableName extends TableNames>(tableName: TableName) =>
		schema.tables[tableName].validator,
	sysId: vSysId,
} as const;

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

export type UserStampedEntity = Extract<Doc<TableNames>, EntityUserStamps>;
export type TimeStampedEntity = Extract<Doc<TableNames>, EntityTimeStamps>;
export type StampedEntity = Extract<Doc<TableNames>, EntityStamps>;
export type StampedTableNames = StampedEntity["_id"]["__tableName"];

// #endregion

// biome-ignore lint/style/noDefaultExport: external
export default schema;
