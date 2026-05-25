import type { RecipeStepShape } from "../recipes";
import type { InjectedStepShape, StructuralCriticism } from "./schemas";

export const injectSafetySteps = (
	steps: RecipeStepShape[],
	stepsToInject: InjectedStepShape[],
): {
	result: RecipeStepShape[];
	stepModifications: { [originalIndex: number]: number };
} => {
	const grouped = Object.groupBy(
		stepsToInject,
		(step) => `${step.targetIndex}:${step.position}`,
	);

	const result: RecipeStepShape[] = [];
	const stepModifications: Record<number, number> = {};

	for (let i = 0; i < steps.length; i++) {
		for (const injected of grouped[`${i}:BEFORE_INDEX`] ?? []) {
			result.push(injected.data);
		}

		stepModifications[i] = result.length;
		const positionedStep = steps[i];

		if (positionedStep) {
			result.push(positionedStep);
		}

		for (const injected of grouped[`${i}:AFTER_INDEX`] ?? []) {
			result.push(injected.data);
		}
	}

	return { result, stepModifications };
};

export const reindexCriticismsWithModifications = (
	criticisms: StructuralCriticism[],
	modifications: Record<number, number>,
): StructuralCriticism[] =>
	criticisms.map((criticism) => ({
		...criticism,
		targetStepIndex:
			modifications[criticism.targetStepIndex] ?? criticism.targetStepIndex,
	}));
