import type { GoogleLanguageModelOptions } from "@ai-sdk/google";

export const safetySettings = [
	{
		// Crucial for food apps to prevent advice on eating
		// inedible items or dangerous prep methods.
		category: "HARM_CATEGORY_DANGEROUS_CONTENT",
		threshold: "BLOCK_ONLY_HIGH",
	},
	{
		// Standard protection for community/social recipe sharing.
		category: "HARM_CATEGORY_HATE_SPEECH",
		threshold: "BLOCK_MEDIUM_AND_ABOVE",
	},
	{
		category: "HARM_CATEGORY_HARASSMENT",
		threshold: "BLOCK_MEDIUM_AND_ABOVE",
	},
	{
		// Prevents "NSFW" food-related content.
		category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
		threshold: "BLOCK_MEDIUM_AND_ABOVE",
	},
	{
		category: "HARM_CATEGORY_UNSPECIFIED",
		threshold: "BLOCK_ONLY_HIGH",
	},
] satisfies GoogleLanguageModelOptions["safetySettings"];
