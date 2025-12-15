import Elysia from "elysia";

import { RecipeAgent, RecipeInputSchema } from "../modules/recipes";

export const v1Routes = new Elysia({
	prefix: "v1",
}).post(
	"generate-recipe",
	async ({ body }) => {
		const result = await RecipeAgent.generateRecipe(body);
		const { output } = result;

		return output;
	},
	{
		body: RecipeInputSchema,
	},
);
