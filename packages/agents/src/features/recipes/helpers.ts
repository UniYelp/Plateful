import { trace } from "@opentelemetry/api";

import { recipeAgent } from "./agent";
import { generateRecipePrompt } from "./prompt";
import type { RecipeGenInput } from "./schemas";

const tracer = trace.getTracer("recipe-generation");

export const generateRecipe = async (input: RecipeGenInput) => {
	return tracer.startActiveSpan("recipe-generator", async (span) => {
		try {
			const { output, text, steps } = await recipeAgent.generate({
				prompt: generateRecipePrompt(input),
			});

			return {
				output,
				text,
				steps,
			};
		} finally {
			span.end();
		}
	});
};
