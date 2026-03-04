import type { Graph } from "effect";

import type { PatchUnion, Prettify } from "@plateful/types";
import type { RecipeMaterialKind } from "../enums";
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

export type MaterialEdge<Kind extends RecipeMaterialKind = RecipeMaterialKind> =
	{
		type: "material";
		stepIndex: number;
	} & RecipeMaterial<Kind>;

/**
 * - start -> material | uses ingredient as a base quantity for the material
 * - material x -> material x | uses output-kind materials as a base quantity for an intermediate or final material
 * - material x -> material y | uses input-kind materials to subtract from the origin material's quantity
 */
export type RecipeGraphEdge = Prettify<
	PatchUnion<IngredientEdge | MaterialEdge>
>;

export type RecipeGraph = Graph.DirectedGraph<RecipeGraphNode, RecipeGraphEdge>;
