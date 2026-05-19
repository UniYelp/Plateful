/// <reference types="dom-chromium-ai" />

export const aiAvailabilityOptions = {
	expectedOutputs: [{ type: "text" }],
} as const satisfies LanguageModelCreateCoreOptions;

export const aiSessionOptions = {
	...aiAvailabilityOptions,
	initialPrompts: [
		{
			role: "system",
			content: `You are Plateful, a strict food safety AI chef assistant.`,
		},
	],
} as const satisfies LanguageModelCreateOptions;

export const localAiEnabledStorageKey = "local-ai-enabled";

export const AI_RESULT_CACHE_KEY_PREFIX = "ai_results_";
export const AI_RESULT_DEFAULT_TTL_MS = 3600000;
