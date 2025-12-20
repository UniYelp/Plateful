import Elysia from "elysia";

import { RecipesModel } from "./model";
import * as RecipeService from "./service";

export const recipes = new Elysia({
	prefix: "recipes",
}).post(
	"generate",
	async ({ body }) => {
		const result = await RecipeService.generateRecipe(body);
		return result;
	},
	{
		body: RecipesModel.generateRecipeBody,
		response: {
			200: RecipesModel.generateRecipeResponse,
		},
	},
);
