import { Graph, Option } from "effect";
import type { Direction, EdgeIndex, Kind, NodeIndex } from "effect/Graph";

import { getNodeIndexByEdge } from "./get-node-index-by-edge";

export const getNodeIndexByEdgeIndex = <N, E, T extends Kind = "directed">(
	graph: Graph.Graph<N, E, T>,
	edgeIndex: EdgeIndex,
	direction: Direction,
): NodeIndex | null =>
	Graph.getEdge(graph, edgeIndex).pipe(
		Option.map((edge) => getNodeIndexByEdge(edge, direction)),
		Option.getOrNull,
	);
