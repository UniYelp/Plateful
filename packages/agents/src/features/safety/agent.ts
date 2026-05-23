import { google } from "@ai-sdk/google";
import { type DeepPartial, Output, stepCountIs, ToolLoopAgent } from "ai";

import { type SafetyOutput, SafetyOutputSchema } from "./schemas";
import { safetyToolsSet } from "./tools";

export const safetyAgent: ToolLoopAgent<
	never,
	typeof safetyToolsSet,
	Output.Output<SafetyOutput, DeepPartial<SafetyOutput>, never>
> = new ToolLoopAgent({
	model: google("gemini-3.5-flash"),
	// TODO: Gemini does not support both tools and output schema validation at the same time, so we will need to split this into two agents or wait for Gemini to support both features together.
	output: Output.object({
		schema: SafetyOutputSchema,
	}),
	tools: safetyToolsSet,
	/**
	 *! Gemini does not support json output tool calling with forced tool calling
	 *? > Forced function calling (ANY mode) with a response mime type: 'application/json' is unsupported
	 */
	// toolChoice: "required",
	stopWhen: stepCountIs(20),
	experimental_telemetry: { isEnabled: true },
});
