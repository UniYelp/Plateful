import { google } from "@ai-sdk/google";
import { stepCountIs, ToolLoopAgent } from "ai";

import { searchSafetyInstructions } from "./tools";

export const safetyAgent = new ToolLoopAgent({
	model: google("gemini-2.5-flash"),
	// TODO: Gemini does not support both tools and output schema validation at the same time, so we will need to split this into two agents or wait for Gemini to support both features together.
	// output: Output.object({
	// 	schema: safetyOutputSchema,
	// }),
	tools: {
		searchSafetyInstructions,
	},
	stopWhen: stepCountIs(20),
	experimental_telemetry: { isEnabled: true },
});
