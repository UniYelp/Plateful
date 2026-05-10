export const IngredientCategory = {
	Vegetables: "vegetables",
	Fruits: "fruits",
	Meat: "meat",
	Seafood: "seafood",
	Fish: "fish",
	Dairy: "dairy",
	Breads: "breads",
	Canned: "canned",
	Baking: "baking",
	Sauces: "sauces",
	Frozen: "frozen",
	Desserts: "desserts",
	Snacks: "snacks",
	Chocolate: "chocolate",
	Candies: "candies",
	Beverages: "beverages",
	Herbs: "herbs",
	Oils: "oils",
	Grains: "grains",
	Inedible: "inedible",
	Other: "other",
} as const;

export type IngredientCategory =
	(typeof IngredientCategory)[keyof typeof IngredientCategory];

export const ingredientCategories = Object.values(IngredientCategory);
