import { Graph } from "effect";

import { MaterialInputKinds, MaterialOutputKinds } from "../constants";
import { RecipeStepBlockType } from "../enums";
import type {
	Recipe,
	RecipeGraph,
	RecipeGraphEdge,
	RecipeGraphNode,
	RecipeIngredient,
	RecipeMaterial,
} from "../types";

export type RecipeGraphInput = {
	ingredients: RecipeIngredient[];
	steps: RecipeMaterial[][];
};

export const createRecipeGraph = (recipe: Recipe): RecipeGraph => {
	const nodeByName = {} as Record<string, number>;

	const graph = Graph.directed<RecipeGraphNode, RecipeGraphEdge>(
		(mutableGraph) => {
            //? Initialize the graph with the ingredients as the base nodes
			for (const ing of recipe.ingredients) {
				nodeByName[ing.name] = Graph.addNode(mutableGraph, {
					...ing,
					type: "ingredient",
				});
			}

			for (const [stepIndex, step] of recipe.steps.entries()) {
                //? Ignore non-material step blocks
                const stepMaterials = step.flatMap<RecipeMaterial>((block) => {
                    const { type, ...data } = block;
					if (type !== RecipeStepBlockType.Material) return [];
					return data as RecipeMaterial;
				});

                //? Add the first appearance of a material as a node
				for (const material of stepMaterials) {
					nodeByName[material.name] ??= Graph.addNode(mutableGraph, {
						...material,
						stepIndex,
						type: "material",
					});
				}

				const inputs = stepMaterials.filter((material) =>
					MaterialInputKinds.has(material.kind),
				);

				const outputs = stepMaterials.filter((material) =>
					MaterialOutputKinds.has(material.kind),
				);

                //? Connect input materials to output materials
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
