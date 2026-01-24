import { EXPIRATION_WARNING_TIME_WINDOW_MS } from "@plateful/ingredients";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { conflict, notFound } from "./errors";
import { householdMutation, householdQuery } from "./households";
import { ingredientFields, vv } from "./schema";
import { isSoftDeleted } from "./utils/soft_delete";

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

		if (!ingredient || isSoftDeleted(ingredient)) {
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
		const ingredient = getHouseholdIngredients(
			ctx,
			args.householdId,
			args.name,
		).unique();

		if (!ingredient) {
			throw notFound({
				entity: "Ingredient",
				in: "Household",
			});
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
			ingredient.householdId !== args.householdId
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

		if (!ingredient || isSoftDeleted(ingredient)) {
			throw new Error("Ingredient Not Found");
		}

		if (ingredient.householdId !== args.householdId) {
			throw new Error(
				`Ingredient ${args.ingredientId} not in household ${args.householdId}`,
			);
		}

		const now = Date.now();
		await ctx.db.patch("ingredients", args.ingredientId, {
			updatedBy: userId,
			deletedAt: now,
		});
	},
});

// #endregion

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
