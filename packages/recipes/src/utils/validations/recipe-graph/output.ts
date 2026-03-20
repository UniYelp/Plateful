import { Graph } from "effect";
import type { EdgeIndex } from "effect/Graph";

import { RecipeMaterialKind } from "../../../enums";
import {
	RecipeHasNoOutputError,
	RecipeValidationError,
	UsedOutputMaterialError,
} from "../../../models";
import type { RecipeGraph, RecipeValidationResult } from "../../../types";
import { getMaterialNodeByEdgeIndex } from "../../recipe-graph";

export const validateRecipeOutput = (
	graph: RecipeGraph,
): RecipeValidationResult<RecipeHasNoOutputError | UsedOutputMaterialError> => {
	const outputMaterialsEdgeIndices = Graph.findEdges(
		graph,
		(edge) =>
			edge.type === "material" && edge.kind === RecipeMaterialKind.Output,
	);

	if (!outputMaterialsEdgeIndices.length) {
		return new RecipeValidationError([new RecipeHasNoOutputError()]);
	}

	const usedOutputMaterialEdgeIndices = outputMaterialsEdgeIndices.filter(
		(edgeIndex) => isUsedOutputMaterial(graph, edgeIndex),
	);

	if (usedOutputMaterialEdgeIndices.length) {
		const usedOutputMaterialIssues = usedOutputMaterialEdgeIndices.flatMap(
			(edgeIndex) => {
				const res = getMaterialNodeByEdgeIndex(graph, {
					edge: {
						index: edgeIndex,
						kind: RecipeMaterialKind.Output,
					},
				});

				if (!res) return [];

				const { node } = res;

				return new UsedOutputMaterialError(node.name);
			},
		);

		return new RecipeValidationError(usedOutputMaterialIssues);
	}

	return null;
};

const isUsedOutputMaterial = (graph: RecipeGraph, edgeIndex: EdgeIndex) => {
	const res = getMaterialNodeByEdgeIndex(graph, {
		edge: {
			index: edgeIndex,
			kind: RecipeMaterialKind.Output,
		},
	});

	if (!res) return false;

	const { index: nodeIndex } = res;

	const neighbors = Graph.neighbors(graph, nodeIndex);

	/**
	 * ? Material nodes with "output-kind" edges are self-referential,
	 * ? so they'll have at least one neighbor, themselves
	 *
	 * ! Checking `length` instead of converting to a `Set`
	 * ! in-case there are other self-referential nodes which shouldn't be there
	 */
	if (neighbors.length > 1) return true;

	return false;
};
