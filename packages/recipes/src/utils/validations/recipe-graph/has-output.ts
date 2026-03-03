import { Graph } from "effect";

import { RecipeMaterialKind } from "../../../enums";
import { RecipeHasNoOutputError, RecipeValidationError } from "../../../models";
import type { RecipeGraph, RecipeValidationResult } from "../../../types";

export const validateRecipeHasOutput = (
	graph: RecipeGraph,
): RecipeValidationResult<RecipeHasNoOutputError> => {
	const outputMaterials = Graph.findEdges(
		graph,
		(edge) =>
			edge.type === "material" && edge.kind === RecipeMaterialKind.Output,
	);

	if (outputMaterials.length) return null;

	return new RecipeValidationError([new RecipeHasNoOutputError()]);
};
