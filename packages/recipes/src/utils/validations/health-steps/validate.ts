import { recipeValidationAccumulator } from "../accumulator";
import { validateNoIrrelevantHealthPriorityStepMetadataFields } from "./irrelevant-metadata-fields";
import { validateNoNoneRefMaterialBlocksInHealthSteps } from "./no-none-ref-material-blocks";

export const validateHealthSteps = recipeValidationAccumulator(
	validateNoNoneRefMaterialBlocksInHealthSteps,
	validateNoIrrelevantHealthPriorityStepMetadataFields,
);
