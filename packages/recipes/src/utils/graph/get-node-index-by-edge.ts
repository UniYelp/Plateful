import type { Direction, Edge, NodeIndex } from "effect/Graph";

export const getNodeIndexByEdge = <E>(
	edge: Edge<E>,
	direction: Direction,
): NodeIndex => (direction === "incoming" ? edge.source : edge.target);
