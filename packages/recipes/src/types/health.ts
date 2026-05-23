import type {
	RecipeMaterialKind,
	RecipeStepBlockType,
	RecipeStepPriority,
} from "../enums";
import type {
	AnyRecipeBlock,
	BaseRecipeStepBlock,
	RecipeMaterial,
} from "./recipe";

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
