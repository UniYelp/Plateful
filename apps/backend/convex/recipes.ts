import { bool } from "@plateful/utils";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { nanoBanana } from "./configs/nano-banana.config";
import { notFound } from "./errors";
import { householdQuery } from "./households";
import { getRecipeIngredients } from "./recipeIngredients";
import { vv } from "./schema";
import { isSoftDeleted } from "./utils/soft_delete";

// #region Queries

export const byHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const recipes = await getHouseholdRecipes(ctx, args.householdId);
		return recipes;
	},
});

export const countByHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const recipes = await getHouseholdRecipes(ctx, args.householdId);
		return recipes.length;
	},
});

export const byIdAndHousehold = householdQuery({
	args: {
		recipeId: vv.id("recipes"),
	},
	handler: async (ctx, args) => {
		const recipe = await ctx.db.get("recipes", args.recipeId);

		if (recipe?.householdId !== args.householdId || isSoftDeleted(recipe)) {
			throw notFound({
				entity: "recipe",
				in: "household",
			});
		}

		if (!recipe.genId) return recipe;

		const imgGen = await getRecipeGenImage(ctx, recipe.genId);

		return Object.assign({}, recipe, { imgGen });
	},
});

export const fullById = householdQuery({
	args: {
		recipeId: vv.id("recipes"),
	},
	handler: async (ctx, args) => {
		const recipe = await ctx.db.get("recipes", args.recipeId);

		ctx.validateHousehold(recipe);

		if (!recipe || isSoftDeleted(recipe)) {
			throw notFound({ entity: "Recipe", in: "Household" });
		}

		const recipeIngredients = await getRecipeIngredients(ctx, args.recipeId);

		const ingredients = await Promise.all(
			recipeIngredients.map(async (recipeIngredient) => {
				const ingredient = await ctx.db.get(
					"ingredients",
					recipeIngredient.ingredientId,
				);

				if (
					!ingredient ||
					isSoftDeleted(ingredient) ||
					ingredient.householdId !== recipe.householdId
				)
					return;

				return {
					quantities: recipeIngredient.quantities,
					ingredient: ingredient,
				};
			}),
		);

		const steps = await ctx.db
			.query("recipeSteps")
			.withIndex("by_recipe_and_index", (q) => q.eq("recipeId", args.recipeId))
			.collect();

		const recipeImgGen = recipe.genId
			? await getRecipeGenImage(ctx, recipe.genId)
			: null;

		return {
			recipe,
			ingredients: ingredients.filter(bool),
			imgGen: recipeImgGen,
			steps,
		};
	},
});

// #endregion

// #region Mutations

// #endregion

// #region Helpers

async function getHouseholdRecipes(
	ctx: QueryCtx,
	householdId: Id<"households">,
) {
	const recipes = await ctx.db
		.query("recipes")
		.withIndex("by_household_deletedAt_title", (q) =>
			q.eq("householdId", householdId).eq("deletedAt", undefined),
		)
		.collect();

	const fullRecipes = await Promise.all(
		recipes.map(async (recipe) => {
			const recipeIngredients = await getRecipeIngredients(ctx, recipe._id);

			const ingredients = await Promise.all(
				recipeIngredients.map(async (recipeIngredient) => {
					const ingredient = await ctx.db.get(
						"ingredients",
						recipeIngredient.ingredientId,
					);

					if (
						!ingredient ||
						isSoftDeleted(ingredient) ||
						ingredient.householdId !== recipe.householdId
					)
						return;

					return {
						quantities: recipeIngredient.quantities,
						ingredient: ingredient,
					};
				}),
			);

			const steps = await ctx.db
				.query("recipeSteps")
				.withIndex("by_recipe_and_index", (q) => q.eq("recipeId", recipe._id))
				.collect();

			const imgGen = recipe.genId
				? await getRecipeGenImage(ctx, recipe.genId)
				: null;

			return {
				recipe,
				ingredients: ingredients.filter(bool),
				imgGen,
				steps,
			};
		}),
	);

	return fullRecipes;
}

async function getRecipeGenImage(
	ctx: QueryCtx,
	genId: Id<"recipeGens">,
	shouldThrow = false,
) {
	const recipeGen = await ctx.db.get("recipeGens", genId);

	if (!recipeGen || isSoftDeleted(recipeGen)) {
		if (shouldThrow) {
			throw notFound({ entity: "recipe generation", by: "generation" });
		}

		return null;
	}

	if (recipeGen.state.status !== "completed" || !recipeGen.state.imgGenId) {
		return null;
	}

	const imgGen = await nanoBanana.get(ctx, {
		generationId: recipeGen.state.imgGenId,
	});

	if (!imgGen) return null;

	return imgGen;
}

// #endregion
