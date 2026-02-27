import type { RecipeGenStatus } from "@backend/recipeGens";

export const GeneratingRecipeStatusesValues = [
	"pending",
	"generating",
	"validating",
] as const;

export type GeneratingRecipeStatus =
	(typeof GeneratingRecipeStatusesValues)[number];

export const FailedRecipeStatusesValues = ["failed"] as const;
export type FailedRecipeStatus = (typeof FailedRecipeStatusesValues)[number];

export const CompletedRecipeStatusesValues = ["completed"] as const;
export type CompletedRecipeStatus =
	(typeof CompletedRecipeStatusesValues)[number];

export const GeneratingRecipeStatuses = new Set<RecipeGenStatus>(
	GeneratingRecipeStatusesValues,
);

export const FailedRecipeStatuses = new Set<RecipeGenStatus>(
	FailedRecipeStatusesValues,
);

export const CompletedRecipeStatuses = new Set<RecipeGenStatus>(
	CompletedRecipeStatusesValues,
);
