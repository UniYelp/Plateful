export const IngredientCategory = {
	Vegetables: "vegetables",
	Fruits: "fruits",
	Meat: "meat",
	Dairy: "dairy",
	Breads: "breads",
	Baking: "baking",
	Beverages: "beverages",
	Candies: "candies",
	Canned: "canned",
	Chocolate: "chocolate",
	Desserts: "desserts",
	Fish: "fish",
	Frozen: "frozen",
	Grains: "grains",
	Herbs: "herbs",
	Inedible: "inedible",
	Oils: "oils",
	Sauces: "sauces",
	Seafood: "seafood",
	Snacks: "snacks",
	Other: "other",
} as const;

export type IngredientCategory =
	(typeof IngredientCategory)[keyof typeof IngredientCategory];

export const ingredientCategories = Object.values(IngredientCategory);
