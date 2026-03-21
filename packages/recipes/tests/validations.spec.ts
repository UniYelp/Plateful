import { describe, expect, it } from "vitest";

import type { Recipe, RecipeIngredient } from "../src";
import {
	createRecipeGraph,
	MaterialQuantityExceededError,
	RecipeHasNoOutputError,
	RecipeMaterialKind,
	RecipeStepBlockType,
	RecipeValidationError,
	UNLIMITED_QUANTITY,
	UnreachableMaterialError,
	validateNoMaterialQuantityExceeded,
	validateNoUnreachableMaterials,
	validateRecipeOutput,
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

			const res = validateRecipeOutput(graph);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<RecipeHasNoOutputError>` when an `output` does not exist", () => {
			const recipe: Recipe = {
				ingredients: rawFaultyIngredients as RecipeIngredient[],
				steps: rawFaultyRecipe.steps,
			};

			const graph = createRecipeGraph(recipe);

			const res = validateRecipeOutput(graph);

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

	describe("noMaterialQuantityExceeded", () => {
		it("should return `null` when all material quantities are within the limits", () => {
			const recipe: Recipe = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				steps: [
					[
						{
							type: RecipeStepBlockType.Material,
							name: "Banana",
							kind: RecipeMaterialKind.Input,
							quantity: { value: 6 },
						},
						{
							type: RecipeStepBlockType.Material,
							name: "Orange",
							kind: RecipeMaterialKind.Input,
							quantity: { value: 2 },
						},
						{
							type: RecipeStepBlockType.Material,
							name: "Smoothie",
							kind: RecipeMaterialKind.Output,
							quantity: { value: 1 },
						},
					],
				],
			};

			const graph = createRecipeGraph(recipe);
			const res = validateNoMaterialQuantityExceeded(graph);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<MaterialQuantityExceededError>` when an input exceeds the provided ingredient quantity", () => {
			const recipe: Recipe = {
				ingredients: [{ name: "Banana", quantity: { value: 1 } }],
				steps: [
					[
						{
							type: RecipeStepBlockType.Material,
							name: "Banana",
							kind: RecipeMaterialKind.Input,
							quantity: { value: 2 },
						},
						{
							type: RecipeStepBlockType.Material,
							name: "Smoothie",
							kind: RecipeMaterialKind.Output,
							quantity: { value: 1 },
						},
					],
				],
			};

			const graph = createRecipeGraph(recipe);
			const res = validateNoMaterialQuantityExceeded(graph);

			expect(res).toBeInstanceOf(RecipeValidationError);

            const issues = (res as RecipeValidationError).issues;
			expect(issues?.[0]).toBeInstanceOf(MaterialQuantityExceededError);

            const issue = issues[0] as MaterialQuantityExceededError;
			expect.soft(issue.id).toBe("Banana");
			expect.soft(issue.required.value).toBe(2);
			expect.soft(issue.available?.[0]?.value).toBe(1);
		});

		it("should return a `RecipeValidationError<MaterialQuantityExceededError>` when a derived input exceeds the produced material quantity", () => {
			const recipe: Recipe = {
				ingredients: [{ name: "Banana", quantity: { value: 2 } }],
				steps: [
					[
						{
							type: RecipeStepBlockType.Material,
							name: "Banana",
							kind: RecipeMaterialKind.Input,
							quantity: { value: 2 },
						},
						{
							type: RecipeStepBlockType.Material,
							name: "Mashed Banana",
							kind: RecipeMaterialKind.DerivedOutput,
							quantity: { value: 1 }, // Only 1 produced
						},
					],
					[
						{
							type: RecipeStepBlockType.Material,
							name: "Mashed Banana",
							kind: RecipeMaterialKind.DerivedInput,
							quantity: { value: 2 }, // But 2 required
						},
						{
							type: RecipeStepBlockType.Material,
							name: "Smoothie",
							kind: RecipeMaterialKind.Output,
							quantity: { value: 1 },
						},
					],
				],
			};

			const graph = createRecipeGraph(recipe);
			const res = validateNoMaterialQuantityExceeded(graph);

			expect(res).toBeInstanceOf(RecipeValidationError);

            const issues = (res as RecipeValidationError).issues;
			expect(issues?.[0]).toBeInstanceOf(MaterialQuantityExceededError);

            const issue = issues[0] as MaterialQuantityExceededError;
			expect.soft(issue.id).toBe("Mashed Banana");
			expect.soft(issue.required.value).toBe(2);
            expect.soft(issue.available).toBeDefined();
            expect.soft(issue.available).toHaveLength(1);
			expect.soft(issue.available?.[0]?.value).toBe(1);
		});

		it("should return `null` when using unlimited ingredients", () => {
			const recipe: Recipe = {
				ingredients: [{ name: "Water", quantity: UNLIMITED_QUANTITY }],
				steps: [
					[
						{
							type: RecipeStepBlockType.Material,
							name: "Water",
							kind: RecipeMaterialKind.Input,
							quantity: { value: 1000 }, // Using a lot
						},
						{
							type: RecipeStepBlockType.Material,
							name: "Drink",
							kind: RecipeMaterialKind.Output,
							quantity: { value: 1000 },
						},
					],
				],
			};

			const graph = createRecipeGraph(recipe);
			const res = validateNoMaterialQuantityExceeded(graph);

			expect(res).toBeNull();
		});

		it("should correctly handle multiple units and conversions if supported", () => {
			// This test assumes that 'cup' and 'tsp' are convertible or at least tracked separately
			const recipe: Recipe = {
				ingredients: [
					{ name: "Water", quantity: { value: 1, unit: "cup" } },
					{ name: "Water", quantity: { value: 2, unit: "cup" } },
				],
				steps: [
					[
						{
							type: RecipeStepBlockType.Material,
							name: "Water",
							kind: RecipeMaterialKind.Input,
							quantity: { value: 4, unit: "cup" }, // Exceeds 3 cups (1 + 2)
						},
						{
							type: RecipeStepBlockType.Material,
							name: "Drink",
							kind: RecipeMaterialKind.Output,
							quantity: { value: 1 },
						},
					],
				],
			};

			const graph = createRecipeGraph(recipe);
			const res = validateNoMaterialQuantityExceeded(graph);

			expect(res).toBeInstanceOf(RecipeValidationError);

            const issues = (res as RecipeValidationError).issues;
			expect(issues?.[0]).toBeInstanceOf(MaterialQuantityExceededError);

            const issue = issues[0] as MaterialQuantityExceededError;
			expect.soft(issue.id).toBe("Water");
			expect.soft(issue.required.value).toBe(4);
			expect.soft(issue.available?.[0]?.value).toBe(3);
		});
	});
});
