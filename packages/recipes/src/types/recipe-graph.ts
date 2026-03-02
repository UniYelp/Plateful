import type { Graph } from "effect";

import type { RecipeIngredient, RecipeMaterial } from "./recipe";

export type StartNode = {
	type: "start";
};

export type MaterialNode = {
	type: "material";
	name: string;
};

export type RecipeGraphNode = StartNode | MaterialNode;

export type IngredientEdge = {
	type: "ingredient";
} & RecipeIngredient;

export type MaterialEdge = {
	type: "material";
	stepIndex: number;
} & RecipeMaterial;

/**
 * - start -> material | uses ingredient as a base quantity for the material
 * - material x -> material x | uses output-kind materials as a base quantity for an intermediate or final material
 * - material x -> material y | uses input-kind materials to subtract from the origin material's quantity
 */
export type RecipeGraphEdge =
	| IngredientEdge
	| MaterialEdge;

export type RecipeGraph = Graph.DirectedGraph<RecipeGraphNode, RecipeGraphEdge>;
