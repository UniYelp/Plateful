import { trace } from "@opentelemetry/api";

import { RecipeAgent } from "@plateful/agents/recipes";
import { SafetyAgent } from "@plateful/agents/safety";
import type { RecipesModel } from "./model";

const recipeTracer = trace.getTracer("recipe-generation");

export const generateRecipe = async (
	body: RecipesModel.ExtendedGenerateRecipeInput,
): Promise<RecipesModel.GenerateRecipeCompleteEventData> => {
	return recipeTracer.startActiveSpan("recipe-generator", async (span) => {
		try {
			const result = await RecipeAgent.generateRecipe(body);
			const { output } = result;

			return output;
		} finally {
			span.end();
		}
	});
};

const safetyTracer = trace.getTracer("safety-agent");

export const safetyCheck = async (
	input: RecipesModel.CheckRecipeSafetyInput,
): Promise<RecipesModel.CheckRecipeSafetyOutput> => {
	return safetyTracer.startActiveSpan("safety-agent", async (span) => {
		try {
			const result = await SafetyAgent.critiqueRecipeSafety(input);
			const { output } = result;

			return output;
		} finally {
			span.end();
		}
	});
};
