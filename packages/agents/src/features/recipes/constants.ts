import type { GoogleLanguageModelOptions } from "@ai-sdk/google";

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

export const safetySettings = [
	{
		// Crucial for food apps to prevent advice on eating
		// inedible items or dangerous prep methods.
		category: "HARM_CATEGORY_DANGEROUS_CONTENT",
		threshold: "BLOCK_LOW_AND_ABOVE",
	},
	{
		// Standard protection for community/social recipe sharing.
		category: "HARM_CATEGORY_HATE_SPEECH",
		threshold: "BLOCK_MEDIUM_AND_ABOVE",
	},
	{
		category: "HARM_CATEGORY_HARASSMENT",
		threshold: "BLOCK_MEDIUM_AND_ABOVE",
	},
	{
		// Prevents "NSFW" food-related content.
		category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
		threshold: "BLOCK_MEDIUM_AND_ABOVE",
	},
	{
		category: "HARM_CATEGORY_UNSPECIFIED",
		threshold: "BLOCK_MEDIUM_AND_ABOVE",
	},
] satisfies GoogleLanguageModelOptions["safetySettings"];

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
	ExtraIngredientsUsedError: "Recipe uses ingredients that were not specified",
	ExtraToolsUsedError: "Recipe uses tools that were not specified",
} as const satisfies {
	[Tag in RecipeValidationIssue["_tag"]]: string;
};
