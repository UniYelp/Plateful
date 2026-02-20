import dedent from "dedent";
import { describe, expect, it } from "vitest";

import { critiqueRecipesSafety } from "../src/features/safety/service";

const goodRecipe = dedent`
	Lemon Herb Roasted Chicken & Asparagus
	Ingredients: 2 chicken breasts, 1 bunch asparagus, 2 tbsp olive oil, 1 lemon, 1 tsp dried oregano, salt/pepper.
	Instructions:
	Preheat oven to 200°C.
	Wash the asparagus under cold running water and trim the woody ends.
	Place chicken and asparagus on a parchment-lined baking sheet.
	Drizzle with olive oil, lemon juice, and seasonings.
	Roast for 20-25 minutes until the chicken reaches an internal temperature of 74°C ($165°F$).
	Let the meat rest for 5 minutes before slicing on a clean cutting board.
`;

const badRecipe = dedent`
	"Quick" Garlic Butter Chicken
	Ingredients: 1 lb raw chicken thighs, 3 cloves garlic, 4 tbsp butter, fresh parsley.

	Instructions:
	Mince the garlic and parsley on a wooden cutting board.
	On that same board, slice the raw chicken into bite-sized pieces.
	Melt butter in a pan over medium heat.
	Add the chicken and garlic to the pan.
	Sauté for 3 minutes until the outside of the chicken is no longer pink (the inside can stay slightly translucent to keep it "juicy").
	Take the remaining raw parsley from the cutting board and toss it into the pan right before serving.
	Store any leftovers on the counter; they will be fine to eat for up to 6 hours.
`;

describe("Safety Agent", () => {
	it(
		"should critique the safety of a recipe",
		{ timeout: 100_000 },
		async () => {
			const goodResult = await critiqueRecipesSafety({ recipe: goodRecipe });
			const badResult = await critiqueRecipesSafety({ recipe: badRecipe });

			console.log(goodResult);
			console.log(badResult);

			expect(goodResult.text).toBeTruthy();
			expect(badResult.text).toBeTruthy();
		},
	);
});
