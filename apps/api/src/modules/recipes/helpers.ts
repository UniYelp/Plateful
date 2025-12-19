import dedent from "dedent";

import { recipeAgent } from "./agent";
import type { RecipeInput } from "./schemas";

export const generateRecipe = async (data: RecipeInput) => {
	const {
		experimental_output: output,
		text,
		steps,
	} = await recipeAgent.generate({
		prompt: dedent`
                Ingredients:
                ${JSON.stringify(data.ingredients, null, 2)}

                Tools:
                ${JSON.stringify(data.tools, null, 2)}

                Tags:
                ${JSON.stringify(data.tags, null, 2)}

                Temperature unit:
                ${data.temperatureUnit}

                Spice level:
                ${data.toleratedSpiceLevel}
            `,
	});

	return {
		output,
		text,
		steps,
	};
};
