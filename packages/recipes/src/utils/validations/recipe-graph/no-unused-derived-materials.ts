import type { UnusedDerivedOutputError } from "../../../models";
import type { RecipeGraph, RecipeValidationResult } from "../../../types";

export const validateUnusedDerivedMaterials = (
	_graph: RecipeGraph,
): RecipeValidationResult<UnusedDerivedOutputError> => {
	// TODO: ensure that each material node's that has an edge of kind derived-output has at least one input/derived-input outgoing e
	return null;
}

