import type { Graph } from "effect";
import type { Direction, EdgeIndex, Kind, NodeIndex } from "effect/Graph";

export const getEdgeIndicesByNodeIndex = <N, E, T extends Kind = "directed">(
	graph: Graph.Graph<N, E, T>,
	nodeIndex: NodeIndex,
	direction: Direction,
): EdgeIndex[] => {
	const adjacencyMap =
		direction === "incoming" ? graph.reverseAdjacency : graph.adjacency;

	return adjacencyMap.get(nodeIndex) ?? [];
};
