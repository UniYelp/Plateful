import { RecipeMaterialKind, RecipeStepPriority } from "../enums";
import type { Quantity } from "../types";

export abstract class BaseRecipeValidationIssue extends Error {
	abstract readonly _tag: string;
	abstract readonly reason: string;
	abstract readonly fix: string | null;
}

export class InternalRecipeGraphError extends BaseRecipeValidationIssue {
	static readonly _tag = "InternalRecipeGraphError";
	static readonly reason = "Internal recipe graph error";

	readonly _tag = InternalRecipeGraphError._tag;
	readonly reason = InternalRecipeGraphError.reason;
	readonly fix = null;

	constructor(public override message: string) {
		super(`${InternalRecipeGraphError.reason}: ${message}`);
	}
}

export class IngredientNotUsedOnlyAsInputError extends BaseRecipeValidationIssue {
	static readonly _tag = "IngredientNotUsedOnlyAsInputError";
	static readonly reason =
		"Recipe has an ingredient that is also treated as an 'output-kind' or a derived material";
	static readonly fix =
		`Do not use ingredients as materials other than ${RecipeMaterialKind.Input} or ${RecipeMaterialKind.Referenced}.`;

	readonly _tag = IngredientNotUsedOnlyAsInputError._tag;
	readonly reason = IngredientNotUsedOnlyAsInputError.reason;
	readonly fix = IngredientNotUsedOnlyAsInputError.fix;

	constructor(
		public id: string,
		public kinds: RecipeMaterialKind[],
	) {
		super(`Ingredient ${id} was also used as ${kinds.join(", ")}`);
	}
}

export class UnreachableMaterialError extends BaseRecipeValidationIssue {
	static readonly _tag = "UnreachableMaterialError";
	static readonly reason =
		"Recipe has materials that could not be traced back to a source ingredient";
	static readonly fix =
		"Ensure all materials can be traced back to a source ingredient";

	readonly _tag = UnreachableMaterialError._tag;
	readonly reason = UnreachableMaterialError.reason;
	readonly fix = UnreachableMaterialError.fix;

	constructor(public id: string) {
		super(`Material ${id} could not be traced back to a source ingredient`);
	}
}

export class RecipeHasNoOutputError extends BaseRecipeValidationIssue {
	static readonly _tag = "RecipeHasNoOutputError";
	static readonly reason = "Recipe does not have an output";
	static readonly fix =
		`Ensure there is at least one ${RecipeMaterialKind.Output} material in the recipe`;

	readonly _tag = RecipeHasNoOutputError._tag;
	readonly reason = RecipeHasNoOutputError.reason;
	readonly fix = RecipeHasNoOutputError.fix;

	constructor() {
		super(`Recipe does not have an output`);
	}
}

export class UsedOutputMaterialError extends BaseRecipeValidationIssue {
	static readonly _tag = "UsedOutputMaterialError";
	static readonly reason =
		"Recipe has an output material that is also used as an input";
	static readonly fix =
		`Do not use ${RecipeMaterialKind.Output} materials as inputs to other steps`;

	readonly _tag = UsedOutputMaterialError._tag;
	readonly reason = UsedOutputMaterialError.reason;
	readonly fix = UsedOutputMaterialError.fix;

	constructor(public id: string) {
		super(`Output Material ${id} has been used to create another material`);
	}
}

export class UnusedDerivedOutputError extends BaseRecipeValidationIssue {
	static readonly _tag = "UnusedDerivedOutputError";
	static readonly reason = "Recipe has an unused derived output material";
	static readonly fix =
		`Ensure all ${RecipeMaterialKind.DerivedOutput} materials are used somewhere in the recipe, change their kind to ${RecipeMaterialKind.Output}, or remove them from the recipe if they are not needed.`;

	readonly _tag = UnusedDerivedOutputError._tag;
	readonly reason = UnusedDerivedOutputError.reason;
	readonly fix = UnusedDerivedOutputError.fix;

	constructor(public id: string) {
		super(
			`Derived-Output Material ${id} was produced in the recipe, but it was not used anywhere`,
		);
	}
}

export class MaterialUsedBeforeProducedError extends BaseRecipeValidationIssue {
	static readonly _tag = "MaterialUsedBeforeProducedError";
	static readonly reason =
		"Recipe has materials that were used before they were produced";
	static readonly fix =
		`Ensure that if a ${RecipeMaterialKind.DerivedInput} or ${RecipeMaterialKind.Referenced} material is used in a step, it is produced in an earlier step. | ${RecipeMaterialKind.Referenced} materials may be used prior to being produced if they reference ingredients (i.e. ${RecipeMaterialKind.Input} materials, since these materials are not themselves produced, but rather provided by the user).`;

	readonly _tag = MaterialUsedBeforeProducedError._tag;
	readonly reason = MaterialUsedBeforeProducedError.reason;
	readonly fix = MaterialUsedBeforeProducedError.fix;

	constructor(public id: string) {
		super(`Material ${id} was used before it was produced`);
	}
}

export class MaterialProducedBeforeInputsError extends BaseRecipeValidationIssue {
	static readonly _tag = "MaterialProducedBeforeInputsError";
	static readonly reason =
		"Recipe has materials that were produced before their inputs were utilized";
	static readonly fix =
		`Ensure that if a ${RecipeMaterialKind.DerivedOutput} or ${RecipeMaterialKind.Output} material is produced in a step, its inputs were mentioned or produced in earlier steps.`;

	readonly _tag = MaterialProducedBeforeInputsError._tag;
	readonly reason = MaterialProducedBeforeInputsError.reason;
	readonly fix = MaterialProducedBeforeInputsError.fix;

	constructor(public id: string) {
		super(`Material ${id} was produced before its inputs were utilized`);
	}
}

export class MaterialQuantityExceededError extends BaseRecipeValidationIssue {
	static readonly _tag = "MaterialQuantityExceededError";
	static readonly reason =
		"Recipe has materials that exceeded their maximum quantity";
	static readonly fix =
		`Ensure that the total amount of an input-kind material used across the recipe does not exceed the amount provided by the user or produced in a previous step`;

	readonly _tag = MaterialQuantityExceededError._tag;
	readonly reason = MaterialQuantityExceededError.reason;
	readonly fix = MaterialQuantityExceededError.fix;

	constructor(
		public id: string,
		public required: Quantity,
		public available?: Quantity[],
	) {
		const requiredQuantity = `${required.value} ${required.unit}`.trim();
		const availableQuantity = available
			? available.map((q) => `${q.value} ${q.unit}`.trim()).join(", ")
			: "N/A";

		super(
			`Material ${id} usage has exceeded the maximum quantity (Required: ${requiredQuantity}, Available: ${availableQuantity})`,
		);
	}

	static from(error: QuantityExceededError, id: string) {
		return new MaterialQuantityExceededError(
			id,
			error.required,
			error.available,
		);
	}
}

export class QuantityExceededError extends Error {
	static readonly _tag = "QuantityExceededError";
	readonly _tag = QuantityExceededError._tag;

	constructor(
		public required: Quantity,
		public available?: Quantity[],
	) {
		const requiredQuantity = `${required.value} ${required.unit}`.trim();
		const availableQuantity = available
			? available.map((q) => `${q.value} ${q.unit}`.trim()).join(", ")
			: "N/A";

		super(
			`Usage has exceeded the maximum quantity (Required: ${requiredQuantity}, Available: ${availableQuantity})`,
		);
	}
}

export class RepeatingMetadataDerivedOutputMaterialInStepError extends BaseRecipeValidationIssue {
	static readonly _tag = "RepeatingMetadataDerivedOutputMaterialInStepError";
	static readonly reason =
		"Recipe has derived-output materials that were declared in metadata and as blocks within the same step";
	static readonly fix =
		`Ensure that derived-output materials are declared either in metadata or as blocks, but not both`;

	readonly _tag = RepeatingMetadataDerivedOutputMaterialInStepError._tag;
	readonly reason = RepeatingMetadataDerivedOutputMaterialInStepError.reason;
	readonly fix = RepeatingMetadataDerivedOutputMaterialInStepError.fix;

	constructor(
		public id: string,
		public stepIndex: number,
	) {
		super(
			`Material ${id} was declared as a derived-output in both metadata and as a block in step ${stepIndex}`,
		);
	}
}

export class UnusedInputMaterialInStepError extends BaseRecipeValidationIssue {
	static readonly _tag = "UnusedInputMaterialInStepError";
	static readonly reason =
		"Recipe has materials that were not used as inputs in some step";
	static readonly fix =
		`Ensure that all input-kind materials are used in the step they are mentioned in`;

	readonly _tag = UnusedInputMaterialInStepError._tag;
	readonly reason = UnusedInputMaterialInStepError.reason;
	readonly fix = UnusedInputMaterialInStepError.fix;

	constructor(
		public id: string,
		public stepIndex: number,
	) {
		super(`Material ${id} was referenced as an input-kind material in step ${stepIndex}, but was not used to create a ${RecipeMaterialKind.DerivedOutput}. Consider changing it to a ${RecipeMaterialKind.Referenced} material`);
	}
}

export class ExtraIngredientsUsedError extends BaseRecipeValidationIssue {
	static readonly _tag = "ExtraIngredientsUsedError";
	static readonly reason = "Recipe uses ingredients that were not specified";
	static readonly fix =
		`Ensure that all ${RecipeMaterialKind.Input} materials used in the recipe were provided as ingredients by the user`;

	readonly _tag = ExtraIngredientsUsedError._tag;
	readonly reason = ExtraIngredientsUsedError.reason;
	readonly fix = ExtraIngredientsUsedError.fix;

	constructor(public ingredient: string) {
		super(`Extra ingredient ${ingredient} was used`);
	}
}

export class MaterialReferencedBeforeIntroductionError extends BaseRecipeValidationIssue {
	static readonly _tag = "MaterialReferencedBeforeIntroductionError";
	static readonly reason =
		"Recipe has materials that were referenced before they were introduced";
	static readonly fix =
		`Ensure that all ${RecipeMaterialKind.Referenced} materials used in the recipe were introduced in a previous step`;

	readonly _tag = MaterialReferencedBeforeIntroductionError._tag;
	readonly reason = MaterialReferencedBeforeIntroductionError.reason;
	readonly fix = MaterialReferencedBeforeIntroductionError.fix;

	constructor(
		public material: string,
		public stepIndex: number | string,
	) {
		super(
			`Material ${material} was referenced before it was introduced in step ${stepIndex}`,
		);
	}
}

export class ExtraToolsUsedError extends BaseRecipeValidationIssue {
	static readonly _tag = "ExtraToolsUsedError";
	static readonly reason = "Recipe uses tools that were not specified";
	static readonly fix =
		`Ensure that all tools used in the recipe were provided as tools by the user`;

	readonly _tag = ExtraToolsUsedError._tag;
	readonly reason = ExtraToolsUsedError.reason;
	readonly fix = ExtraToolsUsedError.fix;

	constructor(public tool: string) {
		super(`Extra tool ${tool} was used`);
	}
}

export class NonRefMaterialBlockInHealthPriorityStepError extends BaseRecipeValidationIssue {
	static readonly _tag = "NonRefMaterialBlockInHealthPriorityStepError";
	static readonly reason =
		`Recipe has non-${RecipeMaterialKind.Referenced} material blocks in ${RecipeStepPriority.Health} priority steps`;
	static readonly fix =
		`Ensure that all ${RecipeStepPriority.Health} priority steps contain only material blocks of kind ${RecipeMaterialKind.Referenced}`;

	readonly _tag = NonRefMaterialBlockInHealthPriorityStepError._tag;
	readonly reason = NonRefMaterialBlockInHealthPriorityStepError.reason;
	readonly fix = NonRefMaterialBlockInHealthPriorityStepError.fix;

	constructor(
		public material: string,
		public stepIndex: number | string,
	) {
		super(
			`Non-${RecipeMaterialKind.Referenced} material block ${material} was used in step ${stepIndex}`,
		);
	}
}

export class HealthPriorityStepContainsIrrelevantMetadataFieldError extends BaseRecipeValidationIssue {
	static readonly _tag =
		"HealthPriorityStepContainsIrrelevantMetadataFieldError";
	static readonly reason =
		`Recipe has ${RecipeStepPriority.Health} priority steps with irrelevant metadata fields`;
	static readonly fix =
		`Ensure that all ${RecipeStepPriority.Health} priority steps contain only metadata fields relevant to the step (e.g. skip fields like 'waste', 'derivedOutputs', etc)`;

	readonly _tag = HealthPriorityStepContainsIrrelevantMetadataFieldError._tag;
	readonly reason =
		HealthPriorityStepContainsIrrelevantMetadataFieldError.reason;
	readonly fix = HealthPriorityStepContainsIrrelevantMetadataFieldError.fix;

	constructor(public stepIndex: number | string) {
		super(
			`Health-priority step ${stepIndex} has metadata fields that are not relevant to the step (e.g. 'waste', 'derivedOutputs', etc)`,
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
	| MaterialQuantityExceededError
	| UnusedInputMaterialInStepError
	| ExtraIngredientsUsedError
	| MaterialReferencedBeforeIntroductionError
	| RepeatingMetadataDerivedOutputMaterialInStepError
	| NonRefMaterialBlockInHealthPriorityStepError
	| HealthPriorityStepContainsIrrelevantMetadataFieldError
	| ExtraToolsUsedError
	| InternalRecipeGraphError;

export class RecipeValidationError<
	T extends RecipeValidationIssue = RecipeValidationIssue,
> extends Error {
	static readonly _tag = "RecipeValidationError";
	readonly _tag = RecipeValidationError._tag;

	constructor(public issues: T[]) {
		super("Recipe Validation Error");
	}
}
