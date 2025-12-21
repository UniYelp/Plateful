import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { apiClient } from "./api/client";
import { notFound } from "./errors";
import { householdMutation, householdQuery } from "./households";
import {
	recipeGenV0ParametersFields,
	SYSTEM_ID,
	vUserStampId,
	vv,
} from "./schema";
import { isSoftDeleted, notDeletedIndex } from "./utils/soft_delete";
import { internalAuthedMutation } from "./with_auth";

// #region Validations

const vRecipeGen = vv.doc("recipeGens");
const vRecipeGenMetadata = vRecipeGen.pick("metadata").fields.metadata;

// #endregion

// #region Queries

export const byHousehold = householdQuery({
	args: {},
	handler: async (ctx, args) => {
		const generations = await ctx.db
			.query("recipeGens")
			.withIndex("by_household_deletedAt", (q) =>
				q.eq("householdId", args.householdId).eq(...notDeletedIndex),
			)
			.collect();

		return generations;
	},
});

export const byIdAndHousehold = householdQuery({
	args: {
		genId: vv.id("recipeGens"),
	},
	handler: async (ctx, args) => {
		const recipeGen = await ctx.db.get("recipeGens", args.genId);

		if (recipeGen?.householdId !== args.householdId || isSoftDeleted(recipeGen))
			throw notFound({ entity: "RecipeGen", in: "Household" });

		return recipeGen;
	},
});

// #endregion

// #region Mutations

export const start = householdMutation({
	args: recipeGenV0ParametersFields,
	handler: async (ctx, args) => {
		const now = Date.now();
		const { _id: userId } = ctx.user;
		const { householdId, ...parameters } = args;

		const genId = await ctx.db.insert("recipeGens", {
			householdId,
			parameters,
			metadata: {
				status: "pending",
			},
			createdBy: userId,
			updatedBy: userId,
			updatedAt: now,
		});

		await ctx.scheduler.runAfter(0, internal.recipeGens.generateRecipe, {
			genId,
			parameters,
		});

		return genId;
	},
});

export const update = internalAuthedMutation({
	args: {
		genId: vv.id("recipeGens"),
		userId: vv.optional(vUserStampId),
		metadata: vRecipeGenMetadata,
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const { genId, metadata, userId } = args;

		const updatedBy = userId ?? ctx.user._id;

		await ctx.db.patch("recipeGens", genId, {
			metadata,
			updatedBy,
			updatedAt: now,
		});
	},
});

// #endregion

// #region Actions

export const generateRecipe = internalAction({
	args: {
		genId: vv.id("recipeGens"),
		parameters: vv.object(recipeGenV0ParametersFields),
	},
	handler: async (ctx, args) => {
		const { genId } = args;

		await ctx.runMutation(internal.recipeGens.update, {
			genId,
			userId: SYSTEM_ID,
			metadata: {
				status: "generating",
			},
		});

		// TODO: map the parameters, fetch response and map back

		// const { parameters: { tags, ingredients } } = args;

		// try {
		// 	const _res = apiClient.recipes.generate.post({
		// 		tags,
		// 		ingredients: [],
		// 	});
		// } catch {}
	},
});

// #endregion

// #region Helpers

// #endregion
