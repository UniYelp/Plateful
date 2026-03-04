import { Graph, Option } from "effect";
import type { NodeIndex } from "effect/Graph";

import { RecipeMaterialKind } from "../../../enums";
import {
	MaterialProducedBeforeInputsError,
	RecipeValidationError,
} from "../../../models";
import type {
	MaterialEdge,
	RecipeGraph,
	RecipeValidationResult,
} from "../../../types";
import { getEdgeIndicesByNodeIndex } from "../../graph/get-edge-indices-by-node-index";
import { isMaterialInputKind } from "../../guards";

/**
 * ? validates that each material node's "derived-input" edges' stepIndex is less-than-equals than the material node's "derived-output" edge stepIndex
 */
export const validateNoMaterialProducedBeforeInputs = (
	graph: RecipeGraph,
): RecipeValidationResult<MaterialProducedBeforeInputsError> => {
	const materialNodeIndices = Graph.findNodes(
		graph,
		(node) => node.type === "material",
	);

	const producesBeforeInputsMaterials = materialNodeIndices.flatMap(
		(nodeIndex) =>
			validateMaterialNotProducedBeforeInputs(graph, nodeIndex) ?? [],
	);

	if (producesBeforeInputsMaterials.length) {
		return new RecipeValidationError(producesBeforeInputsMaterials);
	}

	return null;
};

const validateMaterialNotProducedBeforeInputs = (
	graph: RecipeGraph,
	nodeIndex: NodeIndex,
): null | MaterialProducedBeforeInputsError => {
	const edgeIndices = getEdgeIndicesByNodeIndex(graph, nodeIndex, "incoming");

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

	const inputEdges = edges.filter(
		(edge): edge is MaterialEdge<typeof RecipeMaterialKind.DerivedInput> =>
			!!edge.kind && isMaterialInputKind(edge.kind),
	);

	const isProducedBeforeInputs = inputEdges.some(
		(edge) => edge.stepIndex > producedStepIndex,
	);

	if (isProducedBeforeInputs) {
		return new MaterialProducedBeforeInputsError(derivedOutputEdge.name);
	}

	return null;
};
