import type { Graph } from "effect";

import type { Quantity } from "./quantity";
import type { RecipeIngredient, RecipeMaterial } from "./recipe";

export type RecipeGraphNode =
	| ({
			type: "ingredient";
	  } & RecipeIngredient)
	| ({
			type: "material";
			stepIndex: number;
	  } & RecipeMaterial);

export type RecipeGraphEdge = {
	quantity: Quantity;
	stepIndex: number;
};

export type RecipeGraph = Graph.DirectedGraph<RecipeGraphNode, RecipeGraphEdge>;
