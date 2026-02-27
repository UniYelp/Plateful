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
	let startNodeId = -1;

	const nodeByName = {} as Record<string, number>;

	const graph = Graph.directed<RecipeGraphNode, RecipeGraphEdge>(
		(mutableGraph) => {
			//? Add the start node
			startNodeId = Graph.addNode(mutableGraph, {
				type: "start",
			});

			//? Initialize the graph with the ingredients as the base nodes
			for (const ing of recipe.ingredients) {
				const ingNodeId = Graph.addNode(mutableGraph, {
					type: "material",
					name: ing.name,
				});

				nodeByName[ing.name] = ingNodeId;

				Graph.addEdge(mutableGraph, startNodeId, ingNodeId, {
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
						type: "material",
						name: material.name,
					});
				}

				const inputs = stepMaterials.filter((material) =>
					MaterialInputKinds.has(material.kind),
				);

				const outputs = stepMaterials.filter((material) =>
					MaterialOutputKinds.has(material.kind),
				);

				//? Connect input materials to output materials - output materials link to themselves
				for (const output of outputs) {
					const outputNodeId = nodeByName[output.name];

					if (!outputNodeId) {
						console.warn("Unexpected:", "Material not found in graph", {
							output,
						});

						continue;
					}

					Graph.addEdge(mutableGraph, outputNodeId, outputNodeId, {
						...output,
						stepIndex,
						type: "material",
					});

					for (const input of inputs) {
						const inputNodeId = nodeByName[input.name];

						if (!inputNodeId) {
							console.warn("Unexpected:", "Material not found in graph", {
								input,
							});

							continue;
						}

						Graph.addEdge(mutableGraph, inputNodeId, outputNodeId, {
							...input,
							stepIndex,
							type: "material",
						});
					}
				}
			}
		},
	);

	return graph;
};
