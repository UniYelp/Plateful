import { Graph, Option } from "effect";
import { describe, expect, test } from "vitest";

import type { Recipe, RecipeIngredient } from "../src";
import {
	createRecipeGraph,
	getStartNodeIndex,
	InternalRecipeGraphError,
	isInputKindMaterial,
	isOutputKindMaterial,
} from "../src";
import rawIngredients from "./__fixtures__/recipe/ingredients.json" with {
	type: "json",
};
import rawRecipe from "./__fixtures__/recipe/raw.json" with { type: "json" };

describe("createRecipeGraph", () => {
	const recipe: Recipe = {
		ingredients: rawIngredients as RecipeIngredient[],
		steps: rawRecipe.steps,
	};

	const graph = createRecipeGraph(recipe);

	test("Start node should only have ingredient edges", () => {
		const startNodeIdxRes = getStartNodeIndex(graph);

		expect(startNodeIdxRes).not.toBeInstanceOf(InternalRecipeGraphError);

		const startNodeIdx = Number(startNodeIdxRes);
        
		const startNodeEdges = new Set(graph.adjacency.get(startNodeIdx));

		expect(startNodeEdges.size).toBe(recipe.ingredients.length);

		const startEdges = Array.from(graph.edges.entries()).flatMap(
			([edgeIdx, edge]) => (startNodeEdges.has(edgeIdx) ? edge : []),
		);

		expect(startEdges).toHaveLength(recipe.ingredients.length);

		const areAllIngredientEdges = startEdges.every(
			(edge) => edge.data.type === "ingredient",
		);

		expect(areAllIngredientEdges).toBe(true);
	});

	test("Output-kind Material edges should be cyclic", () => {
		const outputKindEdgesIds = Graph.findEdges(
			graph,
			(data) => data.type === "material" && isOutputKindMaterial(data),
		);

		const outputKindEdges = outputKindEdgesIds.flatMap((edgeIdx) => {
			const edge = Graph.getEdge(graph, edgeIdx);
			if (Option.isNone(edge)) return [];
			return edge.value;
		});

		const areAllSelfEdges = outputKindEdges.every(
			(edge) => edge.source === edge.target,
		);

		expect(areAllSelfEdges).toBe(true);
	});

	test("Input-kind Material edges should be acyclic", () => {
		const inputKindEdgesIds = Graph.findEdges(
			graph,
			(data) => data.type === "material" && isInputKindMaterial(data),
		);

		const inputKindEdges = inputKindEdgesIds.flatMap((edgeIdx) => {
			const edge = Graph.getEdge(graph, edgeIdx);
			if (Option.isNone(edge)) return [];
			return edge.value;
		});

		const areAllSelfEdges = inputKindEdges.every(
			(edge) => edge.source !== edge.target,
		);

		expect(areAllSelfEdges).toBe(true);
	});
});
