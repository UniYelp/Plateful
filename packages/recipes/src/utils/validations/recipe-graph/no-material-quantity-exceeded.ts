import { Graph, Option } from "effect";

import { isDefined } from "@plateful/utils";
import { SCALAR_UNIT, UNLIMITED_QUANTITY } from "../../../constants";
import {
	type InternalRecipeGraphError,
	MaterialQuantityExceededError,
	QuantityExceededError,
	RecipeValidationError,
} from "../../../models";
import type {
	RecipeGraph,
	RecipeValidationResult,
	UnlimitedQuantity,
} from "../../../types";
import type { RecipeIngredientUnit } from "../../../types/units";
import { getEdgeIndicesByNodeIndex } from "../../graph";
import { isInputKindMaterial, isOutputKindMaterial } from "../../guards";
import { consumeQuantity } from "../../ingredients";
import { getStartNodeIndex } from "../../recipe-graph";

export const validateNoMaterialQuantityExceeded = (
	graph: RecipeGraph,
): RecipeValidationResult<
	MaterialQuantityExceededError | InternalRecipeGraphError
> => {
	const materialQuantities = new Map<
		string,
		UnlimitedQuantity | Map<RecipeIngredientUnit, number>
	>();

	const startNodeIdx = getStartNodeIndex(graph);

	if (startNodeIdx instanceof Error) {
		return new RecipeValidationError([startNodeIdx]);
	}

	const walker = Graph.bfs(graph, { start: [startNodeIdx] });
	const issues: MaterialQuantityExceededError[] = [];

	for (const [nodeIdx, node] of walker) {
		if (node.type === "start") continue;

		const incomingEdgeIndices = getEdgeIndicesByNodeIndex(
			graph,
			nodeIdx,
			"incoming",
		);

		const ingredientEdges = incomingEdgeIndices.flatMap((edgeIdx) =>
			Graph.getEdge(graph, edgeIdx).pipe(
				Option.map((edge) => edge.data),
				Option.flatMap((data) =>
					data.type === "ingredient" ? Option.some(data) : Option.none(),
				),
				Option.getOrElse(() => []),
			),
		);

		for (const ingredientEdge of ingredientEdges) {
			const { quantity } = ingredientEdge;

			if (quantity === UNLIMITED_QUANTITY) {
				materialQuantities.set(node.name, UNLIMITED_QUANTITY);
				continue;
			}

			let quantities = materialQuantities.get(node.name);

			if (quantities === UNLIMITED_QUANTITY) continue;

			if (!isDefined(quantities)) {
				quantities = new Map();
				materialQuantities.set(node.name, quantities);
			}

			const unit = quantity.unit ?? SCALAR_UNIT;
			const amount = quantities.get(unit) ?? 0;

			quantities.set(unit, amount + quantity.value);
		}

		const outgoingEdgeIndices = getEdgeIndicesByNodeIndex(
			graph,
			nodeIdx,
			"outgoing",
		);

		const materialEdges = outgoingEdgeIndices.flatMap((edgeIdx) =>
			Graph.getEdge(graph, edgeIdx).pipe(
				Option.map((edge) => edge.data),
				Option.flatMap((data) =>
					data.type === "material" ? Option.some(data) : Option.none(),
				),
				Option.getOrElse(() => []),
			),
		);

		const outputEdges = materialEdges.filter((m) => isOutputKindMaterial(m));

		for (const outputEdge of outputEdges) {
			const { quantity } = outputEdge;

			let quantities = materialQuantities.get(node.name);

			//? This is technically an internal issue
			if (quantities === UNLIMITED_QUANTITY) continue;

			if (!isDefined(quantities)) {
				quantities = new Map();
				materialQuantities.set(node.name, quantities);
			}

			const unit = quantity.unit ?? SCALAR_UNIT;
			const amount = quantities.get(unit) ?? 0;

			quantities.set(unit, amount + quantity.value);
		}

		const inputEdges = materialEdges.filter((m) => isInputKindMaterial(m));

		for (const inputEdge of inputEdges) {
			const { quantity } = inputEdge;

			const quantities = materialQuantities.get(node.name);

			if (quantities === UNLIMITED_QUANTITY) continue;

			if (!isDefined(quantities)) {
				issues.push(new MaterialQuantityExceededError(node.name, quantity));
				continue;
			}

			const remaining = consumeQuantity({
				available: quantities,
				consume: quantity,
			});

			if (remaining instanceof QuantityExceededError) {
				issues.push(MaterialQuantityExceededError.from(remaining, node.name));
				continue;
			}

			materialQuantities.set(node.name, remaining);
		}
	}

	if (issues.length > 0) {
		return new RecipeValidationError(issues);
	}

	return null;
};
