import type { Graph } from "effect";

import type { RecipeIngredient, RecipeMaterial } from "./recipe";

export type RecipeGraphNode =
	| {
			type: "start";
	  }
	| {
			type: "material";
			name: string;
	  };

/**
 * - start -> material | uses ingredient as a base quantity for the material
 * - material x -> material x | uses output-kind materials as a base quantity for an intermediate or final material
 * - material x -> material y | uses input-kind materials to subtract from the origin material's quantity
 */
export type RecipeGraphEdge =
	| ({
			type: "ingredient";
	  } & RecipeIngredient)
	| ({
			type: "material";
			stepIndex: number;
	  } & RecipeMaterial);

export type RecipeGraph = Graph.DirectedGraph<RecipeGraphNode, RecipeGraphEdge>;
