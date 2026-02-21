import { safetyAgent } from "./agent";
import { generateSafetyPrompt } from "./prompt";
import type { SafetyInput } from "./schemas";

const extractSafetyScore = (text: string): number | null => {
	const match = text.match(/Safety Score:\s*(0(?:\.\d+)?|1(?:\.0+)?)/i);
	return match?.[1] ? parseFloat(match[1]) : null;
};

export const critiqueRecipeSafety = async ({ recipe }: SafetyInput) => {
	const { text } = await safetyAgent.generate({
		prompt: generateSafetyPrompt(recipe),
	});

	const score = extractSafetyScore(text);

	return {
		text,
		score,
	};
};
