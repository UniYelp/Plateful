import dedent from "dedent";
import Elysia from "elysia";

import { RecipeInputSchema, recipeAgent } from "../modules/recipes";

export const v1Routes = new Elysia({
	prefix: "v1",
})
	.get("/bob", "bob")
	.post(
		"generate-recipe",
		async ({ body }) => {
			const result = await recipeAgent.generate({
				prompt: dedent`
			        Ingredients:
			        ${JSON.stringify(body.ingredients, null, 2)}

			        Tools:
			        ${JSON.stringify(body.tools, null, 2)}

			        Tags:
			        ${JSON.stringify(body.tags, null, 2)}

			        Temperature unit:
			        ${body.temperatureUnit}

			        Spice level:
			        ${body.toleratedSpiceLevel}
			    `,
			});

			const { experimental_output: output } = result;

			return output;
		},
		{
			body: RecipeInputSchema,
		},
	);
