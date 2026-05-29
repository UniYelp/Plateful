import type {
	RecipeMaterialKind,
	RecipeStepBlockType,
	RecipeStepPriority,
} from "../enums";
import type { Quantity, UnlimitedQuantity } from "./quantity";

export type RecipeIngredient = {
	name: string;
	category?: string;
	quantity: Quantity | UnlimitedQuantity;
};

export type RecipeMaterial<
	Kind extends RecipeMaterialKind = RecipeMaterialKind,
> = {
	name: string;
	kind: Kind;
	quantity: Quantity;
};

export type RecipeTool = {
	name: string;
};

export type RecipeToolBlock = {
	type: typeof RecipeStepBlockType.Tool;
} & RecipeTool;

export type BaseRecipeStepBlock = RecipeToolBlock;

export type RecipeMaterialBlock = {
	type: typeof RecipeStepBlockType.Material;
} & RecipeMaterial;

export type AnyRecipeBlock = {
	type: string;
	[x: string]: unknown;
};

type StepTypedRecipeBlock = RecipeMaterialBlock | BaseRecipeStepBlock;

export type StepRecipeStepBlock = StepTypedRecipeBlock | AnyRecipeBlock;

type RecipeStepMetadataMaterial = {
	name: string;
	quantity: Quantity;
};

export type RecipeStep = {
	blocks: StepRecipeStepBlock[];
	metadata?: {
		priority: RecipeStepPriority;
		setupTime?: string;
		waste?: RecipeStepMetadataMaterial[];
		derivedOutputs?: RecipeStepMetadataMaterial[];
	};
};

export type Recipe = {
	steps: RecipeStep[];
};

export type RecipeInputMetadata = {
	ingredients: RecipeIngredient[];
	tools: "unlimited" | string[];
};
