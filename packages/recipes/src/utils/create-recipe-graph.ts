import { Graph } from "effect";

import { MaterialInputKinds, MaterialOutputKinds } from "../constants";
import type { RecipeMaterialKind } from "../enums";

type Quantity = { value: number; unit?: string };

type RecipeIngredient = {
	name: string;
	quantity: Quantity | "unlimited";
};

type RecipeMaterial = {
	name: string;
	kind: RecipeMaterialKind;
	quantity: Quantity;
};

export type RecipeGraphInput = {
	ingredients: RecipeIngredient[];
	steps: RecipeMaterial[][];
};

type RecipeGraphNode =
	| ({
			type: "ingredient";
	  } & RecipeIngredient)
	| ({
			type: "material";
			stepIndex: number;
	  } & RecipeMaterial);

type RecipeGraphEdge = {
	quantity: Quantity;
	stepIndex: number;
};

export const createRecipeGraph = (
	recipeInput: RecipeGraphInput,
): Graph.DirectedGraph<RecipeGraphNode, RecipeGraphEdge> => {
	const nodeByName = {} as Record<string, number>;

	const graph = Graph.directed<RecipeGraphNode, RecipeGraphEdge>(
		(mutableGraph) => {
			for (const ing of recipeInput.ingredients) {
				nodeByName[ing.name] = Graph.addNode(mutableGraph, {
					...ing,
					type: "ingredient",
				});
			}

			for (const [stepIndex, stepMaterials] of recipeInput.steps.entries()) {
				const inputs = stepMaterials.filter((material) =>
					MaterialInputKinds.has(material.kind),
				);

				const outputs = stepMaterials.filter((material) =>
					MaterialOutputKinds.has(material.kind),
				);

				for (const material of stepMaterials) {
					nodeByName[material.name] ??= Graph.addNode(mutableGraph, {
						...material,
						stepIndex,
						type: "material",
					});
				}

				for (const input of inputs) {
					for (const output of outputs) {
						Graph.addEdge(
							mutableGraph,
							nodeByName[input.name]!,
							nodeByName[output.name]!,
							{ stepIndex, quantity: input.quantity },
						);
					}
				}
			}
		},
	);

	return graph;
};
