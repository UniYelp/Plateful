import { Graph, Option } from "effect";
import type { EdgeIndex, NodeIndex } from "effect/Graph";

import { isDefined } from "@plateful/utils";
import type { RecipeMaterialKind } from "../../enums";
import type { MaterialNode, RecipeGraph } from "../../types";

type Config = {
	edge: {
		index: EdgeIndex;
		kind: RecipeMaterialKind;
	};
};

export const getMaterialNodeByEdgeIndex = (
	graph: RecipeGraph,
	config: Config,
): {
	node: MaterialNode;
	index: NodeIndex;
} | null => {
	const {
		edge: { index: edgeIndex, kind: edgeKind },
	} = config;

	const edge = Graph.getEdge(graph, edgeIndex).pipe(Option.getOrNull);

	if (!isDefined(edge)) return null;

	const { data: edgeData } = edge;

	if (edgeData.kind !== edgeKind) {
		return null;
	}

	const nodeIndex = edge.source;
	const node = Graph.getNode(graph, nodeIndex).pipe(Option.getOrNull);

	if (!isDefined(node)) return null;
	if (node.type !== "material") return null;

	return { node, index: nodeIndex };
};
