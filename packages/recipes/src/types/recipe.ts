import type {
	RecipeMaterialKind,
	RecipeStepBlockType,
	RecipeStepPriority,
} from "../enums";
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

export type RecipeTool = {
	name: string;
};

export type RecipeToolBlock = {
	type: typeof RecipeStepBlockType.Tool;
} & RecipeTool;

export type BaseRecipeStepBlock = RecipeToolBlock;

export type MandatoryRecipeMaterialBlock = {
	type: typeof RecipeStepBlockType.Material;
} & RecipeMaterial;

export type AnyRecipeBlock = {
	type: string;
	[x: string]: unknown;
};

type MandatoryStepTypedRecipeBlock =
	| MandatoryRecipeMaterialBlock
	| BaseRecipeStepBlock;

export type MandatoryStepRecipeStepBlock =
	| MandatoryStepTypedRecipeBlock
	| AnyRecipeBlock;

type RecipeStepMetadataMaterial = {
	name: string;
	quantity: Quantity;
};

export type MandatoryRecipeStep = {
	blocks: MandatoryStepRecipeStepBlock[];
	metadata?: {
		priority: typeof RecipeStepPriority.Mandatory;
		setupTime?: string;
		waste?: RecipeStepMetadataMaterial[];
		derivedOutputs?: RecipeStepMetadataMaterial[];
	};
};

export type HealthRecipeStepMaterialBlock = {
	type: typeof RecipeStepBlockType.Material;
} & RecipeMaterial<typeof RecipeMaterialKind.Referenced>;

type HealthStepTypedRecipeBlock =
	| HealthRecipeStepMaterialBlock
	| BaseRecipeStepBlock;

export type HealthStepRecipeStepBlock =
	| HealthStepTypedRecipeBlock
	| AnyRecipeBlock;

export type HealthRecipeStep = {
	blocks: HealthStepRecipeStepBlock[];
	metadata?: {
		priority: typeof RecipeStepPriority.Health;
		setupTime?: string;
	};
};

export type RecipeStep = MandatoryRecipeStep | HealthRecipeStep;

export type Recipe = {
	steps: RecipeStep[];
};

export type RecipeInputMetadata = {
	ingredients: RecipeIngredient[];
	tools: "unlimited" | string[];
};
