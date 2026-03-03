import { describe, expect, it } from "vitest";

import type { Recipe, RecipeIngredient } from "../src";
import {
	createRecipeGraph,
	RecipeHasNoOutputError,
	RecipeValidationError,
	UnreachableMaterialError,
	validateNoUnreachableMaterials,
	validateRecipeHasOutput,
} from "../src";
import rawIngredients from "./__fixtures__/recipe/ingredients.json" with {
	type: "json",
};
import rawRecipe from "./__fixtures__/recipe/raw.json" with { type: "json" };
import rawFaultyIngredients from "./__fixtures__/recipe-faulty/ingredients.json" with {
	type: "json",
};
import rawFaultyRecipe from "./__fixtures__/recipe-faulty/raw.json" with {
	type: "json",
};

describe("validations", () => {
	describe("hasOutput", () => {
		it("should return `null` when an `output` edge exists", () => {
			const recipe: Recipe = {
				ingredients: rawIngredients as RecipeIngredient[],
				steps: rawRecipe.steps,
			};

			const graph = createRecipeGraph(recipe);

			const res = validateRecipeHasOutput(graph);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<RecipeHasNoOutputError>` when an `output` does not exist", () => {
			const recipe: Recipe = {
				ingredients: rawFaultyIngredients as RecipeIngredient[],
				steps: rawFaultyRecipe.steps,
			};

			const graph = createRecipeGraph(recipe);

			const res = validateRecipeHasOutput(graph);

			expect(res).toBeInstanceOf(RecipeValidationError);
			expect(res?.issues).toHaveLength(1);
			expect(res?.issues?.[0]).toBeInstanceOf(RecipeHasNoOutputError);
		});
	});

	describe("noUnreachableMaterials", () => {
		it("should return `null` when all `material` node are reachable from the `start` node", () => {
			const recipe: Recipe = {
				ingredients: rawIngredients as RecipeIngredient[],
				steps: rawRecipe.steps,
			};

			const graph = createRecipeGraph(recipe);

			const res = validateNoUnreachableMaterials(graph);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<UnreachableMaterialError>` if some `material` nodes aren't reachable from the `start` node", () => {
			const recipe: Recipe = {
				ingredients: rawFaultyIngredients as RecipeIngredient[],
				steps: rawFaultyRecipe.steps,
			};

			const graph = createRecipeGraph(recipe);

			const res = validateNoUnreachableMaterials(graph);

			expect(res).toBeInstanceOf(RecipeValidationError);
			expect(res?.issues?.[0]).toBeInstanceOf(UnreachableMaterialError);
		});
	});
});
