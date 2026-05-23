import type { RecipeStepShape } from "../recipes";
import type { InjectedStepShape } from "./schemas";

export const injectSafetySteps = (
	steps: RecipeStepShape[],
	stepsToInject: InjectedStepShape[],
): RecipeStepShape[] => {
	const grouped = Object.groupBy(
		stepsToInject,
		(step) => `${step.targetIndex}:${step.position}`,
	);

	const result: RecipeStepShape[] = [];

	for (let i = 0; i < steps.length; i++) {
		for (const injected of grouped[`${i}:BEFORE_INDEX`] ?? []) {
			result.push(injected.data);
		}

		const positionedStep = steps[i];

		if (positionedStep) {
			result.push(positionedStep);
		}

		for (const injected of grouped[`${i}:AFTER_INDEX`] ?? []) {
			result.push(injected.data);
		}
	}

	return result;
};
