import { describe, expect, it } from "vitest";

import type { Recipe, RecipeIngredient, RecipeInputMetadata } from "../src";
import {
	createRecipeGraph,
	ExtraIngredientsUsedError,
	ExtraToolsUsedError,
	MaterialQuantityExceededError,
	RecipeHasNoOutputError,
	RecipeMaterialKind,
	RecipeStepBlockType,
	RecipeValidationError,
	UNLIMITED_QUANTITY,
	UnreachableMaterialError,
	validateNoExtraIngredients,
	validateNoExtraTools,
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

describe("ingredients", () => {
	describe("hasOutput", () => {
		it("should return `null` when an `output` edge exists", () => {
			const recipe: Recipe = {
				steps: rawRecipe.steps,
			};

			const input: RecipeInputMetadata = {
				ingredients: rawIngredients as RecipeIngredient[],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);

			const res = validateRecipeOutput(graph);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<RecipeHasNoOutputError>` when an `output` does not exist", () => {
			const recipe: Recipe = {
				steps: rawFaultyRecipe.steps,
			};

			const input: RecipeInputMetadata = {
				ingredients: rawFaultyIngredients as RecipeIngredient[],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);

			const res = validateRecipeOutput(graph);

			expect(res).toBeInstanceOf(RecipeValidationError);
			expect(res?.issues).toHaveLength(1);
			expect(res?.issues?.[0]).toBeInstanceOf(RecipeHasNoOutputError);
		});
	});

	describe("noUnreachableMaterials", () => {
		it("should return `null` when all `material` node are reachable from the `start` node", () => {
			const recipe: Recipe = {
				steps: rawRecipe.steps,
			};

			const input: RecipeInputMetadata = {
				ingredients: rawIngredients as RecipeIngredient[],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);

			const res = validateNoUnreachableMaterials(graph);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<UnreachableMaterialError>` if some `material` nodes aren't reachable from the `start` node", () => {
			const recipe: Recipe = {
				steps: rawFaultyRecipe.steps,
			};

			const input: RecipeInputMetadata = {
				ingredients: rawFaultyIngredients as RecipeIngredient[],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);

			const res = validateNoUnreachableMaterials(graph);

			expect(res).toBeInstanceOf(RecipeValidationError);
			expect(res?.issues?.[0]).toBeInstanceOf(UnreachableMaterialError);
		});
	});

	describe("noMaterialQuantityExceeded", () => {
		it("should return `null` when all material quantities are within the limits", () => {
			const recipe: Recipe = {
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);
			const res = validateNoMaterialQuantityExceeded(graph);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<MaterialQuantityExceededError>` when an input exceeds the provided ingredient quantity", () => {
			const recipe: Recipe = {
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

			const input: RecipeInputMetadata = {
				ingredients: [{ name: "Banana", quantity: { value: 1 } }],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);
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

			const input: RecipeInputMetadata = {
				ingredients: [{ name: "Banana", quantity: { value: 2 } }],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);
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

			const input: RecipeInputMetadata = {
				ingredients: [{ name: "Water", quantity: UNLIMITED_QUANTITY }],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);
			const res = validateNoMaterialQuantityExceeded(graph);

			expect(res).toBeNull();
		});

		it("should correctly handle multiple units and conversions if supported", () => {
			// This test assumes that 'cup' and 'tsp' are convertible or at least tracked separately
			const recipe: Recipe = {
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Water", quantity: { value: 1, unit: "cup" } },
					{ name: "Water", quantity: { value: 2, unit: "cup" } },
				],
				tools: "unlimited",
			};

			const graph = createRecipeGraph(recipe, input);
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

	describe("noExtraIngredients", () => {
		it("should return `null` when no extra ingredients are used", () => {
			const recipe: Recipe = {
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: "unlimited",
			};

			const res = validateNoExtraIngredients(recipe, input);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<ExtraIngredientsUsedError>` when extra ingredients are used", () => {
			const recipe: Recipe = {
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
							name: "Strawberry",
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: "unlimited",
			};

			const res = validateNoExtraIngredients(recipe, input);

			expect(res).toBeInstanceOf(RecipeValidationError);

			const issues = (res as RecipeValidationError).issues;
			expect(issues?.[0]).toBeInstanceOf(ExtraIngredientsUsedError);

			const issue = issues[0] as ExtraIngredientsUsedError;
			expect.soft(issue.ingredient).toBe("Strawberry");
		});
	});
});

describe("tools", () => {
	describe("noExtraTools", () => {
		it("should return `null` when the tools are unlimited w/ tools", () => {
			const recipe: Recipe = {
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: "unlimited",
			};

			const res = validateNoExtraTools(recipe, input);

			expect(res).toBeNull();
		});

		it("should return `null` when the tools are unlimited w/o tools", () => {
			const recipe: Recipe = {
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
							type: RecipeStepBlockType.Tool,
							name: "Blender",
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: "unlimited",
			};

			const res = validateNoExtraTools(recipe, input);

			expect(res).toBeNull();
		});

		it("should return `null` when no extra tools are used", () => {
			const recipe: Recipe = {
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
							type: RecipeStepBlockType.Tool,
							name: "Blender",
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: ["Blender"],
			};

			const res = validateNoExtraTools(recipe, input);

			expect(res).toBeNull();
		});

		it("should return `null` when no extra tools + unlimited is set are used", () => {
			const recipe: Recipe = {
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
							type: RecipeStepBlockType.Tool,
							name: "Blender",
						},
						{
							type: RecipeStepBlockType.Tool,
							name: "Spoon",
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: ["Blender", "unlimited"],
			};

			const res = validateNoExtraTools(recipe, input);

			expect(res).toBeNull();
		});

		it("should return a `RecipeValidationError<ExtraIngredientsUsedError>` when extra ingredients are used", () => {
			const recipe: Recipe = {
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
							type: RecipeStepBlockType.Tool,
							name: "Blender",
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

			const input: RecipeInputMetadata = {
				ingredients: [
					{ name: "Banana", quantity: { value: 6 } },
					{ name: "Orange", quantity: { value: 2 } },
				],
				tools: ["Spoon"],
			};

			const res = validateNoExtraTools(recipe, input);

			expect(res).toBeInstanceOf(RecipeValidationError);

			const issues = (res as RecipeValidationError).issues;
			expect(issues?.[0]).toBeInstanceOf(ExtraToolsUsedError);

			const issue = issues[0] as ExtraToolsUsedError;
			expect.soft(issue.tool).toBe("Spoon");
		});
	});
});
