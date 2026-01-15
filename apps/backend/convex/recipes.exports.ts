import type { EntityShape } from "./schema";

export type RecipeStep = EntityShape<"recipeSteps">;
export type RecipeStepBlock = RecipeStep["blocks"][number];

export type MaterialBlock = Extract<RecipeStepBlock, { type: "material" }>;
