import { Graph, Option } from "effect";
import type { EdgeIndex } from "effect/Graph";

import { isDefined } from "@plateful/utils";
import { RecipeMaterialKind } from "../../../enums";
import {
	RecipeValidationError,
	UnusedDerivedOutputError,
} from "../../../models";
import type { RecipeGraph, RecipeValidationResult } from "../../../types";
import {
	getEdgeIndicesByNodeIndex,
	getNodeIndexByEdgeIndex,
} from "../../graph";

/**
 * ? validate that each material node that has an edge of kind "derived-output" has at least one "derived-input" outgoing edge
 */
export const validateUnusedDerivedMaterials = (
	graph: RecipeGraph,
): RecipeValidationResult<UnusedDerivedOutputError> => {
	const derivedOutputMaterialsEdgeIndices = Graph.findEdges(
		graph,
		(edge) => edge.kind === RecipeMaterialKind.DerivedOutput,
	);

	if (!derivedOutputMaterialsEdgeIndices.length) return null;

	const unusedDerivedOutputs = derivedOutputMaterialsEdgeIndices.flatMap(
		(edgeIndex) => {
			const nodeIndex = getNodeIndexByEdgeIndex(graph, edgeIndex, "incoming");

			if (!isDefined(nodeIndex)) return [];

			const edgeIndices = getEdgeIndicesByNodeIndex(
				graph,
				nodeIndex,
				"outgoing",
			);

			const hasInputKindOutgoingEdge = edgeIndices.some((edgeIndex) =>
				isDerivedOutputMaterialUnused(graph, edgeIndex),
			);

			if (hasInputKindOutgoingEdge) return [];

			const edge = Graph.getEdge(graph, edgeIndex).pipe(Option.getOrNull);

			if (!isDefined(edge)) return [];

			const { data: edgeData } = edge;

			return new UnusedDerivedOutputError(edgeData.name);
		},
	);

	if (unusedDerivedOutputs.length) {
		return new RecipeValidationError(unusedDerivedOutputs);
	}

	return null;
};

const isDerivedOutputMaterialUnused = (
	graph: RecipeGraph,
	edgeIndex: EdgeIndex,
) => {
	const edge = Graph.getEdge(graph, edgeIndex).pipe(Option.getOrNull);

	if (!isDefined(edge)) return false;

	const { data: edgeData } = edge;

	if (edgeData.type !== "material") return false;

	return edgeData.kind === RecipeMaterialKind.DerivedInput;
};
