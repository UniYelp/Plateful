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

export type RecipeBlock = {
	type: string;
	[x: string]: unknown;
};

export type RecipeStepBlock = RecipeMaterialBlock | RecipeBlock;
export type RecipeStep = RecipeStepBlock[];

export type Recipe = {
	ingredients: RecipeIngredient[];
	steps: RecipeStep[];
};
