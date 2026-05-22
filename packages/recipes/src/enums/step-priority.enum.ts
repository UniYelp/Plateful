import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const RecipeStepPriority = {
	Mandatory: "mandatory",
	Health: "health",
} as const;

export type RecipeStepPriority = ValueOf<typeof RecipeStepPriority>;

export const recipeStepPriorities = Enum.toTuple(RecipeStepPriority);
