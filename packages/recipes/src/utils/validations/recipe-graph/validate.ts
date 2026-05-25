import { recipeGraphValidationAccumulator } from "./accumulator";
import { validateIngredientsUsedOnlyAsInputs } from "./ingredient-used-as-only-input";
import { validateNoMaterialProducedBeforeInputs } from "./no-material-produced-before-inputs";
import { validateNoMaterialQuantityExceeded } from "./no-material-quantity-exceeded";
import { validateNoMaterialUsedBeforeProduced } from "./no-material-used-before-produced";
import { validateNoUnreachableMaterials } from "./no-unreachable-materials";
import { validateNoUnusedDerivedMaterials } from "./no-unused-derived-materials";
import { validateRecipeOutput } from "./output";

export const validateRecipeGraph = recipeGraphValidationAccumulator(
	validateRecipeOutput,
	validateIngredientsUsedOnlyAsInputs,
	validateNoUnreachableMaterials,
	validateNoMaterialUsedBeforeProduced,
	validateNoMaterialQuantityExceeded,
	validateNoMaterialProducedBeforeInputs,
	validateNoUnusedDerivedMaterials,
);
