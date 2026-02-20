import { safetyAgent } from "./agent";
import { generateSafetyPrompt } from "./prompt";
import type { SafetyInput } from "./schemas";

export const critiqueRecipesSafety = async ({ recipe }: SafetyInput) => {
	const { text } = await safetyAgent.generate({
		prompt: generateSafetyPrompt(recipe),
	});

	return {
		text,
	};
};
