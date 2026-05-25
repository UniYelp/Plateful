import { safetyAgent } from "./agent";
import { generateSafetyPrompt } from "./prompt";
import type { SafetyInput } from "./schemas";

export const extractSafetyScore = (text: string): number | null => {
	const match = text.match(/Safety Score:\s*(0(?:\.\d+)?|1(?:\.0+)?)/i);
	return match?.[1] ? parseFloat(match[1]) : null;
};

export const critiqueRecipeSafety = async (input: SafetyInput) => {
	const { text, output, steps } = await safetyAgent.generate({
		prompt: generateSafetyPrompt(input),
	});

	// const score = extractSafetyScore(text);

	return {
		// score,
		output,
		text,
		steps,
	};
};
