import { SafetyAgent, type SafetyInput } from "@plateful/agents/safety";

export const critiqueRecipeSafety = async ({ recipe }: SafetyInput) => {
	const result = await SafetyAgent.critiqueRecipeSafety({ recipe });
	const { text, score } = result;

	return {
		text,
		score,
	};
};
