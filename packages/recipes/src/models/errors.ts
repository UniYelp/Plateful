import type { RecipeMaterialKind } from "../enums";
import type { Quantity } from "../types";

export class InternalRecipeGraphError extends Error {
	static readonly _tag = "InternalRecipeGraphError";
	readonly _tag = InternalRecipeGraphError._tag;

	constructor(public override message: string) {
		super(`Internal Recipe Graph Error: ${message}`);
	}
}

export class IngredientNotUsedOnlyAsInputError extends Error {
	static readonly _tag = "IngredientNotUsedOnlyAsInputError";
	readonly _tag = IngredientNotUsedOnlyAsInputError._tag;

	constructor(
		public id: string,
		public kinds: RecipeMaterialKind[],
	) {
		super(`Ingredient ${id} was also used as ${kinds.join(", ")}`);
	}
}

export class UnreachableMaterialError extends Error {
	static readonly _tag = "UnreachableMaterialError";
	readonly _tag = UnreachableMaterialError._tag;

	constructor(public id: string) {
		super(`Material ${id} could not be traced back to a source ingredient`);
	}
}

export class RecipeHasNoOutputError extends Error {
	static readonly _tag = "RecipeHasNoOutputError";
	readonly _tag = RecipeHasNoOutputError._tag;

	constructor() {
		super(`Recipe does not have an output`);
	}
}

export class UsedOutputMaterialError extends Error {
	static readonly _tag = "UsedOutputMaterialError";
	readonly _tag = UsedOutputMaterialError._tag;

	constructor(public id: string) {
		super(`Output Material ${id} has been used to create another material`);
	}
}

export class UnusedDerivedOutputError extends Error {
	static readonly _tag = "UnusedDerivedOutputError";
	readonly _tag = UnusedDerivedOutputError._tag;

	constructor(public id: string) {
		super(
			`Derived-Output Material ${id} was produced in the recipe, but it was not used anywhere`,
		);
	}
}

export class MaterialUsedBeforeProducedError extends Error {
	static readonly _tag = "MaterialUsedBeforeProducedError";
	readonly _tag = MaterialUsedBeforeProducedError._tag;

	constructor(public id: string) {
		super(`Material ${id} was used before it was produced`);
	}
}

export class MaterialProducedBeforeInputsError extends Error {
	static readonly _tag = "MaterialProducedBeforeInputsError";
	readonly _tag = MaterialProducedBeforeInputsError._tag;

	constructor(public id: string) {
		super(`Material ${id} was produced before its inputs were utilized`);
	}
}

export class MaterialQuantityExceededError extends Error {
	static readonly _tag = "MaterialQuantityExceededError";
	readonly _tag = MaterialQuantityExceededError._tag;

	constructor(
		public id: string,
		public used: Quantity,
		public available?: Quantity,
	) {
		const usedQuantity = `${used.value} ${used.unit}`.trim();
		const availableQuantity = available
			? `${available.value} ${available.unit}`.trim()
			: 0;

		super(
			`Material ${id} usage has exceeded the maximum quantity (Used: ${usedQuantity}, Available: ${availableQuantity})`,
		);
	}
}

export type RecipeValidationIssue =
	| IngredientNotUsedOnlyAsInputError
	| UnreachableMaterialError
	| RecipeHasNoOutputError
	| UsedOutputMaterialError
	| UnusedDerivedOutputError
	| MaterialUsedBeforeProducedError
	| MaterialProducedBeforeInputsError
	| MaterialQuantityExceededError;

export class RecipeValidationError<
	T extends RecipeValidationIssue = RecipeValidationIssue,
> extends Error {
	static readonly _tag = "RecipeValidationError";
	readonly _tag = RecipeValidationError._tag;

	constructor(public issues: T[]) {
		super("Recipe Validation Error");
	}
}
