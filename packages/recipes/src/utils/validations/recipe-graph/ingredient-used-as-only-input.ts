import { Graph, Option } from "effect";
import type { NodeIndex } from "effect/Graph";

import { RecipeMaterialKind } from "../../../enums";
import {
	IngredientNotUsedOnlyAsInputError,
	RecipeValidationError,
} from "../../../models";
import type { RecipeGraph, RecipeValidationResult } from "../../../types";
import { getNodeIndexByEdgeIndex } from "../../graph";
import { getEdgeIndicesByNodeIndex } from "../../graph/get-edge-indices-by-node-index";

/**
 * ? validates nodes which have incoming ingredient edges only have outgoing "input" edges
 */
export const validateIngredientsUsedOnlyAsInputs = (
	graph: RecipeGraph,
): RecipeValidationResult<IngredientNotUsedOnlyAsInputError> => {
	const ingredientEdgeIndices = Graph.findEdges(
		graph,
		(node) => node.type === "ingredient",
	);

	const ingredientNodeIndices = Array.from(
		new Set(
			ingredientEdgeIndices.flatMap(
				(edgeIndex) =>
					getNodeIndexByEdgeIndex(graph, edgeIndex, "outgoing") ?? [],
			),
		),
	);

	const ingredientNotOnlyUsedAsInputs = ingredientNodeIndices.flatMap(
		(nodeIndex) => validateIngredientUsedOnlyAsInputs(graph, nodeIndex) ?? [],
	);

	if (ingredientNotOnlyUsedAsInputs.length) {
		return new RecipeValidationError(ingredientNotOnlyUsedAsInputs);
	}

	return null;
};

const validateIngredientUsedOnlyAsInputs = (
	graph: RecipeGraph,
	nodeIndex: NodeIndex,
): null | IngredientNotUsedOnlyAsInputError => {
	const edgeIndices = getEdgeIndicesByNodeIndex(graph, nodeIndex, "outgoing");

	const edges = edgeIndices.flatMap(
		(edgeIndex) =>
			Graph.getEdge(graph, edgeIndex).pipe(
				Option.flatMap((edge) =>
					edge.data.type === "material"
						? Option.some(edge.data)
						: Option.none(),
				),
				Option.getOrNull,
			) ?? [],
	);

	const edgeKinds = new Set(edges.map((edge) => edge.kind));
	edgeKinds.delete(RecipeMaterialKind.Input);

	const nonInputEdgeKinds = Array.from(edgeKinds);

	if (!nonInputEdgeKinds.length) return null;

	const node = Graph.getNode(graph, nodeIndex).pipe(Option.getOrNull);

	if (node?.type !== "material") return null;

	return new IngredientNotUsedOnlyAsInputError(node.name, nonInputEdgeKinds);
};
