import { recipeValidationAccumulator } from "./accumulator";
import { validateHealthSteps } from "./health-steps";
import { validateNoExtraIngredients } from "./no-extra-ingredient";
import { validateNoExtraTools } from "./no-extra-tools";
import { validateNoRefMaterialBeforeIntro } from "./no-reference-before-intro";
import { validateNoRepeatingMetadataDerivedOutputMaterialsInSteps } from "./no-repeating-metadata-materials";
import { validateNoUnusedInputMaterialsInStep } from "./no-unused-input-in-step";

export const validateRecipeMisc = recipeValidationAccumulator(
	validateNoUnusedInputMaterialsInStep,
	validateNoRefMaterialBeforeIntro,
	validateNoRepeatingMetadataDerivedOutputMaterialsInSteps,
	validateNoExtraIngredients,
	validateNoExtraTools,
	validateHealthSteps,
);
