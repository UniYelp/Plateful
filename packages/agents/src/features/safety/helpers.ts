import { trace } from "@opentelemetry/api";

import { safetyAgent } from "./agent";
import { generateSafetyPrompt } from "./prompt";
import type { SafetyInput } from "./schemas";

const tracer = trace.getTracer("safety-agent");

const extractSafetyScore = (text: string): number | null => {
	const match = text.match(/Safety Score:\s*(0(?:\.\d+)?|1(?:\.0+)?)/i);
	return match?.[1] ? parseFloat(match[1]) : null;
};

export const critiqueRecipeSafety = async ({ recipe }: SafetyInput) => {
	return tracer.startActiveSpan("safety-agent", async (span) => {
		try {
			const { text } = await safetyAgent.generate({
				prompt: generateSafetyPrompt(recipe),
			});

			const score = extractSafetyScore(text);

			return {
				text,
				score,
			};
		} finally {
			span.end();
		}
	});
};
