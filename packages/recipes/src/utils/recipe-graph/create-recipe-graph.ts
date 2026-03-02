import { Graph } from "effect";
import type { NodeIndex } from "effect/Graph";

import { RecipeStepBlockType } from "../../enums";
import type {
	IngredientEdge,
	MaterialEdge,
	MaterialNode,
	Recipe,
	RecipeGraph,
	RecipeGraphEdge,
	RecipeGraphNode,
	RecipeIngredient,
	RecipeMaterial,
	StartNode,
} from "../../types";
import { isInputKindMaterial, isOutputKindMaterial } from "../guards";

export type RecipeGraphInput = {
	ingredients: RecipeIngredient[];
	steps: RecipeMaterial[][];
};

export const createRecipeGraph = (recipe: Recipe): RecipeGraph => {
	let startNodeId: NodeIndex = -1;

	const nodeByName = {} as Record<string, NodeIndex>;

	const graph = Graph.directed<RecipeGraphNode, RecipeGraphEdge>(
		(mutableGraph) => {
			//? Add the start node
			startNodeId = Graph.addNode(mutableGraph, {
				type: "start",
			} satisfies StartNode);

			//? Initialize the graph with the ingredients as the base nodes
			for (const ing of recipe.ingredients) {
				const ingNodeId = Graph.addNode(mutableGraph, {
					type: "material",
					name: ing.name,
				} satisfies MaterialNode);

				nodeByName[ing.name] = ingNodeId;

				Graph.addEdge(mutableGraph, startNodeId, ingNodeId, {
					...ing,
					type: "ingredient",
				} satisfies IngredientEdge);
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
					} satisfies MaterialNode);
				}

				const inputs = stepMaterials.filter((material) =>
					isInputKindMaterial(material),
				);

				const outputs = stepMaterials.filter((material) =>
					isOutputKindMaterial(material),
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
					} satisfies MaterialEdge);

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
						} satisfies MaterialEdge);
					}
				}
			}
		},
	);

	return graph;
};
