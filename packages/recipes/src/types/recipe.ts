import type { RecipeMaterialKind, RecipeStepBlockType } from "../enums";
import type { Quantity, UnlimitedQuantity } from "./quantity";

export type RecipeIngredient = {
	name: string;
	quantity: Quantity | UnlimitedQuantity;
};

export type RecipeMaterial<
	Kind extends RecipeMaterialKind = RecipeMaterialKind,
> = {
	name: string;
	kind: Kind;
	quantity: Quantity;
};

export type RecipeMaterialBlock = {
	type: typeof RecipeStepBlockType.Material;
} & RecipeMaterial;

export type RecipeTool = {
	name: string;
};

export type RecipeToolBlock = {
	type: typeof RecipeStepBlockType.Tool;
} & RecipeTool;

export type AnyRecipeBlock = {
	type: string;
	[x: string]: unknown;
};

type TypedRecipeBlock = RecipeMaterialBlock | RecipeToolBlock;

export type RecipeStepBlock = TypedRecipeBlock | AnyRecipeBlock;
export type RecipeStep = RecipeStepBlock[];

export type Recipe = {
	steps: RecipeStep[];
};

export type RecipeInputMetadata = {
	ingredients: RecipeIngredient[];
	tools: "unlimited" | string[];
};
