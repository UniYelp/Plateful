import {
	IngredientNotUsedOnlyAsInputError,
	InternalRecipeGraphError,
	MaterialProducedBeforeInputsError,
	MaterialQuantityExceededError,
	MaterialUsedBeforeProducedError,
	RecipeHasNoOutputError,
	type RecipeValidationIssue,
	UnreachableMaterialError,
	UnusedDerivedOutputError,
	UsedOutputMaterialError,
} from "@plateful/recipes";

export const errorMessageByErrorTag = {
	[RecipeHasNoOutputError._tag]: "Recipe does not have an output",
	[UsedOutputMaterialError._tag]:
		"Recipe has an output material that is also used as an input",
	[IngredientNotUsedOnlyAsInputError._tag]:
		"Recipe has an ingredient that is also treated as an 'output-kind' material",
	[UnreachableMaterialError._tag]:
		"Recipe has materials that could not be traced back to a source ingredient",
	[UnusedDerivedOutputError._tag]: "Recipe has an unused derived output",
	[MaterialUsedBeforeProducedError._tag]:
		"Recipe has materials that were used before they were produced",
	[MaterialProducedBeforeInputsError._tag]:
		"Recipe has materials that were produced before their inputs were utilized",
	[MaterialQuantityExceededError._tag]:
		"Recipe has materials that exceeded their maximum quantity",
	[InternalRecipeGraphError._tag]: "Internal recipe graph error",
} as const satisfies {
	[Tag in RecipeValidationIssue["_tag"]]: string;
};
