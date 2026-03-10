import { Graph, Option } from "effect";
import type { NodeIndex } from "effect/Graph";

import { RecipeMaterialKind } from "../../../enums";
import {
	MaterialUsedBeforeProducedError,
	RecipeValidationError,
} from "../../../models";
import type {
	MaterialEdge,
	RecipeGraph,
	RecipeValidationResult,
} from "../../../types";
import { getEdgeIndicesByNodeIndex } from "../../graph/get-edge-indices-by-node-index";

/**
 * ? validates that each material node's "derived-input" edges' stepIndex is greater than the material node's "derived-output" edge stepIndex
 */
export const validateNoMaterialUsedBeforeProduced = (
	graph: RecipeGraph,
): RecipeValidationResult<MaterialUsedBeforeProducedError> => {
	const materialNodeIndices = Graph.findNodes(
		graph,
		(node) => node.type === "material",
	);

	const usedBeforeProducedMaterials = materialNodeIndices.flatMap(
		(nodeIndex) =>
			validateMaterialNotUsedBeforeProduced(graph, nodeIndex) ?? [],
	);

	if (usedBeforeProducedMaterials.length) {
		return new RecipeValidationError(usedBeforeProducedMaterials);
	}

	return null;
};

const validateMaterialNotUsedBeforeProduced = (
	graph: RecipeGraph,
	nodeIndex: NodeIndex,
): null | MaterialUsedBeforeProducedError => {
	const edgeIndices = getEdgeIndicesByNodeIndex(graph, nodeIndex, "outgoing");

	const edges = edgeIndices.flatMap(
		(edgeIndex) =>
			Graph.getEdge(graph, edgeIndex).pipe(
				Option.map((edge) => edge.data),
				Option.getOrNull,
			) ?? [],
	);

	const derivedOutputEdge = edges.find(
		(edge): edge is MaterialEdge<typeof RecipeMaterialKind.DerivedOutput> =>
			edge.kind === RecipeMaterialKind.DerivedOutput,
	);

	if (!derivedOutputEdge) return null;

	const producedStepIndex = derivedOutputEdge.stepIndex;

	const derivedInputEdges = edges.filter(
		(edge): edge is MaterialEdge<typeof RecipeMaterialKind.DerivedInput> =>
			edge.kind === RecipeMaterialKind.DerivedInput,
	);

	const isUsedBeforeProduced = derivedInputEdges.some(
		(edge) => edge.stepIndex <= producedStepIndex,
	);

	if (isUsedBeforeProduced) {
		return new MaterialUsedBeforeProducedError(derivedOutputEdge.name);
	}

	return null;
};
