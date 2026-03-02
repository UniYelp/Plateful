import { Graph } from "effect";

import { RecipeMaterialKind } from "../../../enums";
import { NoOutputError, RecipeValidationError } from "../../../models";
import type { RecipeGraph, RecipeValidationResult } from "../../../types";

export const validateRecipeHasOutput = (
	graph: RecipeGraph,
): RecipeValidationResult<NoOutputError> => {
	const outputMaterials = Graph.findEdges(
		graph,
		(edge) =>
			edge.type === "material" && edge.kind === RecipeMaterialKind.Output,
	);

	if (outputMaterials.length) return true;

	return new RecipeValidationError([new NoOutputError()]);
};
