import { Graph } from "effect";

import type { MaterialNode, RecipeGraph } from "../../types";

export const getUnusedIngredients = (graph: RecipeGraph): MaterialNode[] => {
	const sinksWalker = Graph.externals(graph, { direction: "outgoing" });
	const sinks = Graph.values(sinksWalker);

	const unusedIngredients = Array.from(sinks).flatMap((sink) =>
		sink.type === "start" ? [] : sink,
	);

	return unusedIngredients;
};
