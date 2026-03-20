import { Graph, Option } from "effect";
import type { NodeIndex } from "effect/Graph";

import type { IngredientUnit } from "@plateful/ingredients";
import { getIngredientUnitConversions } from "@plateful/ingredients";
import { isDefined } from "@plateful/utils";
import { UNLIMITED_QUANTITY } from "../../../constants";
import { RecipeMaterialKind } from "../../../enums";
import {
	type InternalRecipeGraphError,
	MaterialQuantityExceededError,
	RecipeValidationError,
} from "../../../models";
import type {
	IngredientEdge,
	MaterialEdge,
	Quantity,
	RecipeGraph,
	RecipeValidationResult,
	UnlimitedQuantity,
} from "../../../types";
import { getEdgeIndicesByNodeIndex } from "../../graph";
import { isInputKindMaterial, isOutputKindMaterial } from "../../guards";
import { getStartNodeIndex } from "../../recipe-graph";

const SCALAR_UNIT = "__scalar__";

// TODO: continue & write better unit consumption
export const validateNoMaterialQuantityExceeded = (
	graph: RecipeGraph,
): RecipeValidationResult<
	MaterialQuantityExceededError | InternalRecipeGraphError
> => {
	const materialQuantities = new Map<
		string,
		UnlimitedQuantity | Map<IngredientUnit | typeof SCALAR_UNIT, number>
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

		const inputEdges = materialEdges.filter((m) => isInputKindMaterial(m));

		for (const inputEdge of inputEdges) {
			const { quantity } = inputEdge;

			const quantities = materialQuantities.get(node.name);

			if (quantities === UNLIMITED_QUANTITY) continue;

			if (!isDefined(quantities)) {
				issues.push(new MaterialQuantityExceededError(node.name, quantity));
				continue;
			}

			const { unit } = quantity;

			if (!unit) {
				const amount = quantities.get(SCALAR_UNIT) ?? 0;

				if (amount < quantity.value) {
					issues.push(
						new MaterialQuantityExceededError(
							node.name,
							quantity,
							Array.from(quantities.entries()).map(([unit, amount]) => ({
								unit: unit === SCALAR_UNIT ? undefined : unit,
								value: amount,
							})),
						),
					);
				}
			}

			// const availableUnits = quantities.keys();

			// const closestUnit = getIngredientUnitConversions();

			// const amount = quantities.get(unit) ?? 0;

			// quantities.set(unit, amount);

			// TODO: continue & write better unit consumption
		}

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
	}

	return null;
};
