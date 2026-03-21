import { Graph, Option } from "effect";
import type { Direction, NodeIndex } from "effect/Graph";

import { isDefined } from "@plateful/utils";
import type { RecipeMaterialKind } from "../../enums";
import type { RecipeGraph } from "../../types";
import { getNodeIndexByEdge } from "../graph/get-node-index-by-edge";

export const getMaterialNodeIndicesByKind = (
	graph: RecipeGraph,
	kind: RecipeMaterialKind,
	direction: Direction,
): NodeIndex[] => {
	const edgeIndices = new Set(
		Graph.findEdges(graph, (edge) => edge.kind === kind),
	);

	const edges = Array.from(edgeIndices)
		.map((edgeIndex) => Graph.getEdge(graph, edgeIndex).pipe(Option.getOrNull))
		.filter((edge) => isDefined(edge));

	const nodeIndices = Array.from(
		new Set(edges.map((edge) => getNodeIndexByEdge(edge, direction))),
	);

	return nodeIndices;
};
