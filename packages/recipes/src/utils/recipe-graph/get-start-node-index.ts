import { Graph } from "effect";

import { isDefined } from "@plateful/utils";
import { InternalRecipeGraphError } from "../../models";
import type { RecipeGraph } from "../../types";

const EXPECTED_START_NODES_AMOUNT = 1;

export const getStartNodeIndex = (
	graph: RecipeGraph,
): number | InternalRecipeGraphError => {
	const startNodes = Graph.findNodes(graph, (data) => data.type === "start");

	if (startNodes.length !== EXPECTED_START_NODES_AMOUNT) {
		return new InternalRecipeGraphError(
			"Recipe graph has an unexpected number of start nodes (expected " +
				EXPECTED_START_NODES_AMOUNT +
				", got " +
				startNodes.length +
				")",
		);
	}

	const [startNodeIdx] = startNodes;

	if (!isDefined(startNodeIdx)) {
		return new InternalRecipeGraphError("Recipe graph has no start node");
	}

	return startNodeIdx;
};
