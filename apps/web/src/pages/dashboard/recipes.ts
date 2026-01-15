// Mock recipes data

// Mock recipe data
export const mockRecipe = {
	id: "1",
	title: "Spaghetti Carbonara",
	description:
		"Classic Italian pasta dish with eggs, cheese, and pancetta. A creamy, rich pasta that's perfect for a quick weeknight dinner.",
	image: "/spaghetti-carbonara-plated.jpg",
	cookTime: 25,
	difficulty: "Medium",
	servings: 4,
	rating: 4.8,
	tags: ["Italian", "Pasta", "Quick", "Comfort Food"],
	ingredients: [
		{ name: "Spaghetti", amount: "400g", available: true },
		{ name: "Eggs", amount: "4 large", available: true },
		{ name: "Parmesan Cheese", amount: "100g grated", available: true },
		{ name: "Pancetta", amount: "150g diced", available: false },
		{ name: "Black Pepper", amount: "1 tsp freshly ground", available: true },
		{ name: "Salt", amount: "to taste", available: true },
	],
	steps: [
		"Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente.",
		"While pasta cooks, heat a large skillet over medium heat and cook pancetta until crispy, about 5-7 minutes.",
		"In a bowl, whisk together eggs, grated Parmesan, and freshly ground black pepper.",
		"Reserve 1 cup of pasta cooking water, then drain the pasta.",
		"Immediately add hot pasta to the skillet with pancetta and toss to combine.",
		"Remove from heat and quickly stir in the egg mixture, adding pasta water gradually until creamy.",
		"Serve immediately with extra Parmesan and black pepper.",
	],
	nutritionInfo: {
		calories: 520,
		protein: "22g",
		carbs: "65g",
		fat: "18g",
	},
	advantages: [
		"Quick to make",
		"Uses simple ingredients",
		"Authentic Italian recipe",
	],
	canCook: false,
	missingIngredients: ["Pancetta"],
	lastCooked: "2024-01-10",
	variants: [],
};

export const difficultyColors = {
	Easy: "bg-green-100 text-green-800",
	Medium: "bg-yellow-100 text-yellow-800",
	Hard: "bg-red-100 text-red-800",
};
