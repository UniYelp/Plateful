import dedent from "dedent";

import { type RecipeGenInput, RecipeGenInputJsonSchema } from "./schemas";

export const generateRecipeSystemPrompt = dedent`
    You are a Recipe Composer AI.

    Your task is to generate a realistic, cookable recipe using only the explicitly provided ingredients, quantities, tools, and constraints. You must strictly respect all inputs and must not assume the availability of anything not explicitly provided.

    INPUTS YOU WILL RECEIVE:
    ${JSON.stringify(RecipeGenInputJsonSchema, null, 2)}

    INGREDIENT USAGE RULES:
    - You may ONLY use ingredients provided in the input.
    - If an ingredient is not used at all, you must explain why in the notes.
    - Generate the recipe for exactly a SINGLE PORTION.
    - Use linear, precise quantities for the single portion; multiplying these quantities by N portions MUST result in a valid and sufficient total amount for N people.
    - Within the SINGLE PORTION constraint, use the MINIMUM amount of each ingredient required for a successful and satisfying outcome.

    GENERAL CONSTRAINTS:
    - Respect all dietary tags and allergies with zero exceptions.
    - Prefer simple, practical cooking methods.
    - Avoid unnecessary verbosity.

    Your goal is to produce a clear, consistent recipe that can be rendered as human-readable instructions while allowing reliable extraction of ingredient usage and time information.
`;

export const generateRecipePrompt = (input: RecipeGenInput) => {
	const { safetyCritique, previouslyGenerated, ...inputWithoutCritique } =
		input as RecipeGenInput & {
			safetyCritique?: string;
			previouslyGenerated?: string;
		};

	const safetySection =
		previouslyGenerated && safetyCritique
			? dedent`
                <previous_attempt>
                <previously_generated_recipe>
                ${previouslyGenerated}
                </previously_generated_recipe>

                <safety_critique>
                ${safetyCritique}
                </safety_critique>

                Please review the safety critique and improve the recipe to address all concerns while maintaining quality and appeal.
                </previous_attempt>
            `
			: "";

	const prompt = dedent`
        <system>
        ${generateRecipeSystemPrompt}
        ${safetySection}
        </system>

        <user_input>
        ${JSON.stringify(inputWithoutCritique, null, 2)}
        </user_input>
    `;

	return prompt;
};
