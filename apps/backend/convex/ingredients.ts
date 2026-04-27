import {
	EXPIRATION_WARNING_TIME_WINDOW_MS,
	type IngredientUnit,
} from "@plateful/ingredients";
import {
	buildQuantitiesMap,
	consumeQuantity,
	type RecipeIngredientUnit,
	SCALAR_UNIT,
} from "@plateful/recipes";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { conflict, notFound } from "./errors";
import { householdMutation, householdQuery } from "./households";
import { ingredientFields, ingredientQuantityFields, vv } from "./schema";
import { isSoftDeleted } from "./utils/soft_delete";

/** Round to 10 decimal places to eliminate binary floating point drift. */
const ROUND_PRECISION = 1e10;
const round = (n: number) => Math.round(n * ROUND_PRECISION) / ROUND_PRECISION;

// #region Validators

// #region Queries

export const byHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const ingredients = await getHouseholdIngredients(
			ctx,
			args.householdId,
		).collect();

		return ingredients;
	},
});

export const byId = householdQuery({
	args: {
		ingredientId: vv.id("ingredients"),
	},
	handler: async (ctx, args) => {
		const ingredient = await ctx.db.get("ingredients", args.ingredientId);

		if (
			!ingredient ||
			isSoftDeleted(ingredient) ||
			!ctx.isHousehold(ingredient)
		) {
			throw notFound({
				entity: "Ingredient",
				in: "Household",
			});
		}

		return ingredient;
	},
});

export const uniqueByName = householdQuery({
	args: {
		name: vv.string(),
	},
	handler: async (ctx, args) => {
		const ingredient = await getHouseholdIngredients(
			ctx,
			args.householdId,
			args.name,
		).unique();

		if (!ingredient) {
			return null;
		}

		return ingredient;
	},
});

export const ingredientsCount = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const ingredients = await getHouseholdIngredients(
			ctx,
			args.householdId,
		).collect();

		return ingredients.length;
	},
});

export const expiringSoonIngredients = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const ingredients = await getHouseholdIngredients(
			ctx,
			args.householdId,
		).collect();

		const expiryWindow = Date.now() + EXPIRATION_WARNING_TIME_WINDOW_MS;

		const expiringSoonIngredients = ingredients.filter((ingredient) => {
			return ingredient.quantities.some(
				(quantity) => quantity.expiresAt && quantity.expiresAt <= expiryWindow,
			);
		});

		return expiringSoonIngredients;
	},
});

// #endregion

// #region Mutations
export const add = householdMutation({
	args: ingredientFields,
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		const similarIngredient = await getHouseholdIngredients(
			ctx,
			args.householdId,
			args.name,
		).unique();

		if (similarIngredient) {
			throw conflict({ entity: "ingredient", field: "name" });
		}

		const now = Date.now();

		const ingredientId = await ctx.db.insert("ingredients", {
			name: args.name,
			description: args.description || undefined,
			images: args.images,
			quantities: args.quantities.map((q) => ({
				...q,
				unit: q.unit || undefined,
			})),
			category: args.category,
			tags: args.tags,
			householdId: args.householdId,
			createdBy: userId,
			updatedBy: userId,
			updatedAt: now,
		});

		return ingredientId;
	},
});

export const edit = householdMutation({
	args: {
		ingredientId: vv.id("ingredients"),
		...ingredientFields,
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		const ingredient = await ctx.db.get("ingredients", args.ingredientId);

		if (
			!ingredient ||
			isSoftDeleted(ingredient) ||
			!ctx.isHousehold(ingredient)
		) {
			throw notFound({
				entity: "Ingredient",
				in: "Household",
			});
		}

		if (ingredient.name !== args.name) {
			console.log({ currName: ingredient.name, newName: args.name });

			const similarIngredient = await getHouseholdIngredients(
				ctx,
				args.householdId,
				args.name,
			).unique();

			if (similarIngredient) {
				throw conflict({ entity: "ingredient", field: "name" });
			}
		}

		const now = Date.now();
		await ctx.db.patch("ingredients", args.ingredientId, {
			name: args.name,
			description: args.description || undefined,
			images: args.images,
			quantities: args.quantities.map((q) => ({
				...q,
				unit: q.unit || undefined,
			})),
			category: args.category,
			tags: args.tags,
			updatedBy: userId,
			updatedAt: now,
		});

		return args.ingredientId;
	},
});

export const deleteIngredient = householdMutation({
	args: {
		ingredientId: vv.id("ingredients"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;

		const ingredient = await ctx.db.get("ingredients", args.ingredientId);

		if (
			!ingredient ||
			isSoftDeleted(ingredient) ||
			!ctx.isHousehold(ingredient)
		) {
			throw notFound({
				entity: "Ingredient",
				in: "Household",
			});
		}

		const now = Date.now();
		await ctx.db.patch("ingredients", args.ingredientId, {
			updatedBy: userId,
			deletedAt: now,
		});
	},
});

export const upsertIngredients = householdMutation({
	args: {
		ingredients: vv.array(
			vv.object({
				name: vv.string(),
				amount: vv.number(),
				unit: vv.optional(vv.string()),
				description: vv.optional(vv.string()),
				category: vv.optional(vv.string()),
				expiresAt: vv.optional(vv.number()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		const { householdId, ingredients } = args;
		const now = Date.now();

		for (const ing of ingredients) {
			const existing = await getHouseholdIngredients(
				ctx,
				householdId,
				ing.name,
			).unique();

			if (existing) {
				await ctx.db.patch(existing._id, {
					quantities: [
						...existing.quantities,
						{
							amount: ing.amount,
							unit: ing.unit || undefined,
							expiresAt: ing.expiresAt,
						},
					],
					updatedBy: userId,
					updatedAt: now,
				});
			} else {
				await ctx.db.insert("ingredients", {
					householdId,
					name: ing.name,
					description: ing.description,
					category: ing.category || "Uncategorized",
					tags: [],
					quantities: [
						{
							amount: ing.amount,
							unit: ing.unit || undefined,
							expiresAt: ing.expiresAt,
						},
					],
					images: [],
					createdBy: userId,
					updatedBy: userId,
					updatedAt: now,
				});
			}
		}
	},
});

// #endregion

export const addQuantity = householdMutation({
	args: {
		ingredientId: vv.id("ingredients"),
		amount: vv.number(),
		unit: vv.optional(vv.string()),
		expiresAt: vv.optional(vv.number()),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		const ingredient = await ctx.db.get("ingredients", args.ingredientId);

		if (
			!ingredient ||
			isSoftDeleted(ingredient) ||
			!ctx.isHousehold(ingredient)
		) {
			throw notFound({ entity: "Ingredient", in: "Household" });
		}

		const now = Date.now();
		await ctx.db.patch("ingredients", args.ingredientId, {
			quantities: [
				...ingredient.quantities,
				{ amount: args.amount, unit: args.unit, expiresAt: args.expiresAt },
			],
			updatedBy: userId,
			updatedAt: now,
		});
	},
});

export const removeQuantityAt = householdMutation({
	args: {
		ingredientId: vv.id("ingredients"),
		index: vv.number(),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		const ingredient = await ctx.db.get("ingredients", args.ingredientId);

		if (
			!ingredient ||
			isSoftDeleted(ingredient) ||
			!ctx.isHousehold(ingredient)
		) {
			throw notFound({ entity: "Ingredient", in: "Household" });
		}

		const updated = ingredient.quantities.filter((_, i) => i !== args.index);
		const now = Date.now();
		await ctx.db.patch("ingredients", args.ingredientId, {
			quantities: updated,
			updatedBy: userId,
			updatedAt: now,
		});
	},
});

export const mergeQuantities = householdMutation({
	args: {
		ingredientId: vv.id("ingredients"),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		const ingredient = await ctx.db.get("ingredients", args.ingredientId);

		if (
			!ingredient ||
			isSoftDeleted(ingredient) ||
			!ctx.isHousehold(ingredient)
		) {
			throw notFound({ entity: "Ingredient", in: "Household" });
		}

		const mergedByKey = new Map<
			string,
			{ amount: number; unit?: string; expiresAt?: number }
		>();

		for (const q of ingredient.quantities) {
			const unitKey = q.unit || "no-unit";
			const expiryKey = q.expiresAt ? q.expiresAt.toString() : "no-expiry";
			const key = `${unitKey}-${expiryKey}`;

			const existing = mergedByKey.get(key);

			if (!existing) {
				mergedByKey.set(key, { ...q });
			} else {
				existing.amount = round(existing.amount + q.amount);
			}
		}

		const updatedQuantities = Array.from(mergedByKey.values());

		const now = Date.now();
		await ctx.db.patch("ingredients", args.ingredientId, {
			quantities: updatedQuantities,
			updatedBy: userId,
			updatedAt: now,
		});
	},
});

export const consumeForRecipe = householdMutation({
	args: {
		ingredients: vv.array(
			vv.object({
				ingredientId: vv.id("ingredients"),
				quantities: vv.array(vv.object(ingredientQuantityFields)),
			}),
		),
	},
	handler: async (ctx, args) => {
		const { _id: userId } = ctx.user;
		const { ingredients } = args;
		const now = Date.now();

		const results: {
			name: string;
			quantities: { amount: number; unit?: string }[];
		}[] = [];

		const updates: Array<{
			ingredientId: Doc<"ingredients">["_id"];
			quantities: Doc<"ingredients">["quantities"];
		}> = [];

		for (const { ingredientId, quantities: neededQuantities } of ingredients) {
			const ingredient = await ctx.db.get("ingredients", ingredientId);

			if (
				!ingredient ||
				isSoftDeleted(ingredient) ||
				!ctx.isHousehold(ingredient)
			) {
				throw notFound({ entity: "Ingredient", in: "Household" });
			}

			// Mutable copy of quantities, sorted by expiry date ascending (soonest first)
			// undefined expiresAt goes to the end
			const remaining = ingredient.quantities
				.map((q) => ({ ...q }))
				.sort((a, b) => {
					if (!a.expiresAt && !b.expiresAt) return 0;
					if (!a.expiresAt) return 1;
					if (!b.expiresAt) return -1;
					return a.expiresAt - b.expiresAt;
				});

			let availableMap = buildQuantitiesMap(
				remaining.map((q) => ({
					value: q.amount,
					unit: q.unit === SCALAR_UNIT ? undefined : (q.unit as IngredientUnit),
				})),
			);

			for (const needed of neededQuantities) {
				const res = consumeQuantity({
					available: availableMap,
					consume: {
						value: needed.amount,
						unit:
							needed.unit === SCALAR_UNIT
								? undefined
								: (needed.unit as IngredientUnit),
					},
				});

				if (res instanceof Error) {
					throw conflict({
						entity: "Ingredient",
						field: "quantities",
						message: `Not enough ${ingredient.name} to consume`,
					});
				}

				availableMap = res;
			}

			for (const slot of remaining.toReversed()) {
				const unit = slot.unit ?? SCALAR_UNIT;
				const available = availableMap.get(unit as RecipeIngredientUnit) ?? 0;
				const amountToKeep = Math.min(slot.amount, available);

				slot.amount = amountToKeep;
				availableMap.set(
					unit as RecipeIngredientUnit,
					round(available - amountToKeep),
				);
			}

			const updatedQuantities = remaining.filter((q) => q.amount > 0);

			updates.push({ ingredientId, quantities: updatedQuantities });
			results.push({ name: ingredient.name, quantities: updatedQuantities });
		}

		for (const update of updates) {
			await ctx.db.patch("ingredients", update.ingredientId, {
				quantities: update.quantities,
				updatedBy: userId,
				updatedAt: now,
			});
		}

		return results;
	},
});

// #region helpers
const getHouseholdIngredients = (
	ctx: QueryCtx,
	householdId: Doc<"households">["_id"],
	name?: string,
) => {
	return ctx.db
		.query("ingredients")
		.withIndex("by_household_deletedAt_name", (q) => {
			const filter = q
				.eq("householdId", householdId)
				.eq("deletedAt", undefined);

			if (name) {
				return filter.eq("name", name);
			}

			return filter;
		});
};
// #endregion
