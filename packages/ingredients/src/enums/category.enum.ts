export const IngredientCategory = {
	Vegetables: "vegetables",
	Fruits: "fruits",
	Meat: "meat",
	Dairy: "dairy",
	Herbs: "herbs",
	Oils: "oils",
	Grains: "grains",
	Other: "other",
} as const;

export type IngredientCategory = typeof IngredientCategory[keyof typeof IngredientCategory];

export const ingredientCategories = Object.values(IngredientCategory);
