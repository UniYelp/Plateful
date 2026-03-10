import { Graph } from "effect";

import {
	RecipeValidationError,
	UnreachableMaterialError,
} from "../../../models";
import type { RecipeGraph, RecipeValidationResult } from "../../../types";

export const validateNoUnreachableMaterials = (
	graph: RecipeGraph,
): RecipeValidationResult<UnreachableMaterialError> => {
	const sourcesWalker = Graph.externals(graph, { direction: "incoming" });
	const sources = Graph.values(sourcesWalker);

	const unreachableMaterials = Array.from(sources).flatMap((source) =>
		source.type === "start" ? [] : source,
	);

	if (!unreachableMaterials.length) return null;

	const issues = unreachableMaterials.map(
		(material) => new UnreachableMaterialError(material.name),
	);

	return new RecipeValidationError(issues);
};
