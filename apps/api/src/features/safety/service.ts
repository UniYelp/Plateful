import { SafetyAgent, type SafetyInput } from "@plateful/agents/safety";

export const critiqueRecipesSafety = async ({ recipe }: SafetyInput) => {
	const result = await SafetyAgent.critiqueRecipesSafety({ recipe });
	const { text } = result;

	return {
		text
	};
};
