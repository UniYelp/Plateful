import {
	MaterialProducedBeforeInputsError,
	MaterialQuantityExceededError,
	MaterialUsedBeforeProducedError,
	NoOutputError,
	type RecipeValidationIssue,
	UnreachableMaterialError,
	UnusedDerivedOutputError,
} from "@plateful/recipes";

export const errorMessageByErrorTag = {
	[NoOutputError._tag]: "Recipe does not have an output",
	[UnreachableMaterialError._tag]:
		"Recipe has materials that could not be traced back to a source ingredient",
	[UnusedDerivedOutputError._tag]: "Recipe has an unused derived output",
	[MaterialUsedBeforeProducedError._tag]:
		"Recipe has materials that were used before they were produced",
	[MaterialProducedBeforeInputsError._tag]:
		"Recipe has materials that were produced before their inputs were utilized",
	[MaterialQuantityExceededError._tag]:
		"Recipe has materials that exceeded their maximum quantity",
} as const satisfies {
	[Tag in RecipeValidationIssue["_tag"]]: string;
};
