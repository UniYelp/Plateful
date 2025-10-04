// Mock meal plans data
export const mockMealPlans = [
	{
		id: "1",
		title: "Healthy Week",
		description: "A week of nutritious and balanced meals",
		startDate: "2024-01-15",
		endDate: "2024-01-21",
		status: "active",
		meals: [
			{
				day: "Monday",
				breakfast: "Greek Yogurt Bowl",
				lunch: "Caesar Salad",
				dinner: "Grilled Chicken",
			},
			{
				day: "Tuesday",
				breakfast: "Oatmeal",
				lunch: "Chicken Wrap",
				dinner: "Spaghetti Carbonara",
			},
			{
				day: "Wednesday",
				breakfast: "Smoothie",
				lunch: "Soup",
				dinner: "Beef Stir Fry",
			},
			{
				day: "Thursday",
				breakfast: "Toast",
				lunch: "Salad",
				dinner: "Fish Tacos",
			},
			{
				day: "Friday",
				breakfast: "Pancakes",
				lunch: "Sandwich",
				dinner: "Pizza Night",
			},
			{
				day: "Saturday",
				breakfast: "Eggs Benedict",
				lunch: "Brunch",
				dinner: "BBQ",
			},
			{
				day: "Sunday",
				breakfast: "French Toast",
				lunch: "Leftovers",
				dinner: "Roast Dinner",
			},
		],
		totalRecipes: 21,
		missingIngredients: 5,
	},
	{
		id: "2",
		title: "Quick & Easy",
		description: "Fast meals for busy weekdays",
		startDate: "2024-01-22",
		endDate: "2024-01-28",
		status: "upcoming",
		meals: [
			{
				day: "Monday",
				breakfast: "Cereal",
				lunch: "Sandwich",
				dinner: "Pasta",
			},
			{
				day: "Tuesday",
				breakfast: "Toast",
				lunch: "Salad",
				dinner: "Stir Fry",
			},
			{ day: "Wednesday", breakfast: "Yogurt", lunch: "Soup", dinner: "Tacos" },
			{
				day: "Thursday",
				breakfast: "Smoothie",
				lunch: "Wrap",
				dinner: "Curry",
			},
			{
				day: "Friday",
				breakfast: "Oatmeal",
				lunch: "Pizza",
				dinner: "Takeout",
			},
		],
		totalRecipes: 15,
		missingIngredients: 2,
	},
	{
		id: "3",
		title: "Family Favorites",
		description: "Crowd-pleasing meals the whole family loves",
		startDate: "2024-01-08",
		endDate: "2024-01-14",
		status: "completed",
		meals: [
			{
				day: "Monday",
				breakfast: "Pancakes",
				lunch: "Mac & Cheese",
				dinner: "Meatballs",
			},
			{
				day: "Tuesday",
				breakfast: "Cereal",
				lunch: "Grilled Cheese",
				dinner: "Chicken Nuggets",
			},
			{
				day: "Wednesday",
				breakfast: "Toast",
				lunch: "PB&J",
				dinner: "Spaghetti",
			},
			{
				day: "Thursday",
				breakfast: "Waffles",
				lunch: "Hot Dogs",
				dinner: "Burgers",
			},
			{
				day: "Friday",
				breakfast: "Eggs",
				lunch: "Pizza",
				dinner: "Fish Sticks",
			},
			{
				day: "Saturday",
				breakfast: "French Toast",
				lunch: "Sandwiches",
				dinner: "Tacos",
			},
			{
				day: "Sunday",
				breakfast: "Bagels",
				lunch: "Soup",
				dinner: "Roast Chicken",
			},
		],
		totalRecipes: 21,
		missingIngredients: 0,
	},
];

export const statusColors = {
	active: "bg-green-100 text-green-800",
	upcoming: "bg-blue-100 text-blue-800",
	completed: "bg-gray-100 text-gray-800",
};

export const mealPlanTags = [
    { id: "vegan", label: "Vegan", color: "bg-green-100 text-green-800" },
    {
        id: "vegetarian",
        label: "Vegetarian",
        color: "bg-green-100 text-green-700",
    },
    { id: "healthy", label: "Healthy", color: "bg-emerald-100 text-emerald-800" },
    { id: "low-effort", label: "Low Effort", color: "bg-blue-100 text-blue-800" },
    { id: "quick", label: "Quick Meals", color: "bg-orange-100 text-orange-800" },
    {
        id: "budget",
        label: "Budget Friendly",
        color: "bg-yellow-100 text-yellow-800",
    },
    {
        id: "high-protein",
        label: "High Protein",
        color: "bg-red-100 text-red-800",
    },
    { id: "low-carb", label: "Low Carb", color: "bg-indigo-100 text-indigo-800" },
];

// Mock available recipes with enhanced details
export const availableRecipes = [
    {
        id: "1",
        title: "Spaghetti Carbonara",
        cookTime: 25,
        difficulty: "Medium",
        servings: 4,
        image: "/spaghetti-carbonara.png",
        tags: ["Italian", "Comfort"],
        description: "Classic creamy pasta with eggs and pancetta",
    },
    {
        id: "2",
        title: "Chicken Tikka Masala",
        cookTime: 45,
        difficulty: "Hard",
        servings: 4,
        image: "/chicken-tikka-masala.png",
        tags: ["Indian", "Spicy"],
        description: "Tender chicken in rich tomato curry sauce",
    },
    {
        id: "3",
        title: "Caesar Salad",
        cookTime: 15,
        difficulty: "Easy",
        servings: 2,
        image: "/caesar-salad.png",
        tags: ["Healthy", "Quick"],
        description: "Fresh romaine with parmesan and croutons",
    },
    {
        id: "4",
        title: "Beef Stir Fry",
        cookTime: 20,
        difficulty: "Easy",
        servings: 3,
        image: "/beef-stir-fry.jpg",
        tags: ["Asian", "Quick"],
        description: "Tender beef with crisp vegetables",
    },
    {
        id: "5",
        title: "Greek Yogurt Bowl",
        cookTime: 5,
        difficulty: "Easy",
        servings: 1,
        image: "/greek-yogurt-bowl.jpg",
        tags: ["Healthy", "Breakfast"],
        description: "Protein-rich yogurt with fresh toppings",
    },
    {
        id: "6",
        title: "Grilled Chicken",
        cookTime: 30,
        difficulty: "Medium",
        servings: 4,
        image: "/grilled-chicken.png",
        tags: ["Healthy", "High Protein"],
        description: "Perfectly seasoned grilled chicken breast",
    },
];

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

export const fullMealTypes = [
    {
        key: "breakfast",
        label: "Breakfast",
        color: "bg-orange-100 text-orange-800",
    },
    { key: "lunch", label: "Lunch", color: "bg-blue-100 text-blue-800" },
    { key: "dinner", label: "Dinner", color: "bg-purple-100 text-purple-800" },
];

export interface MealPlan {
    [key: string]: {
        [key: string]: string; // meal type -> recipe id
    };
}


// Mock meal plan data
export const mockMealPlan = {
    id: "1",
    title: "Healthy Week",
    description: "A week of nutritious and balanced meals",
    startDate: "2024-01-15",
    endDate: "2024-01-21",
    status: "active",
    meals: [
        {
            day: "Monday",
            date: "Jan 15",
            breakfast: {
                id: "5",
                title: "Greek Yogurt Bowl",
                cookTime: 5,
                canCook: true,
            },
            lunch: { id: "3", title: "Caesar Salad", cookTime: 15, canCook: true },
            dinner: {
                id: "6",
                title: "Grilled Chicken",
                cookTime: 30,
                canCook: false,
            },
        },
        {
            day: "Tuesday",
            date: "Jan 16",
            breakfast: {
                id: "8",
                title: "Oatmeal with Berries",
                cookTime: 10,
                canCook: true,
            },
            lunch: { id: "9", title: "Chicken Wrap", cookTime: 15, canCook: false },
            dinner: {
                id: "1",
                title: "Spaghetti Carbonara",
                cookTime: 25,
                canCook: true,
            },
        },
        {
            day: "Wednesday",
            date: "Jan 17",
            breakfast: {
                id: "10",
                title: "Green Smoothie",
                cookTime: 5,
                canCook: true,
            },
            lunch: { id: "7", title: "Vegetable Soup", cookTime: 40, canCook: true },
            dinner: { id: "4", title: "Beef Stir Fry", cookTime: 20, canCook: false },
        },
        {
            day: "Thursday",
            date: "Jan 18",
            breakfast: {
                id: "11",
                title: "Avocado Toast",
                cookTime: 10,
                canCook: true,
            },
            lunch: { id: "12", title: "Quinoa Salad", cookTime: 20, canCook: true },
            dinner: { id: "13", title: "Fish Tacos", cookTime: 25, canCook: false },
        },
        {
            day: "Friday",
            date: "Jan 19",
            breakfast: { id: "14", title: "Pancakes", cookTime: 20, canCook: true },
            lunch: { id: "15", title: "Turkey Sandwich", cookTime: 5, canCook: true },
            dinner: { id: "16", title: "Pizza Night", cookTime: 30, canCook: true },
        },
        {
            day: "Saturday",
            date: "Jan 20",
            breakfast: {
                id: "17",
                title: "Eggs Benedict",
                cookTime: 25,
                canCook: false,
            },
            lunch: { id: "18", title: "Brunch Salad", cookTime: 15, canCook: true },
            dinner: { id: "19", title: "BBQ Ribs", cookTime: 120, canCook: false },
        },
        {
            day: "Sunday",
            date: "Jan 21",
            breakfast: {
                id: "20",
                title: "French Toast",
                cookTime: 15,
                canCook: true,
            },
            lunch: { id: "21", title: "Leftover BBQ", cookTime: 5, canCook: true },
            dinner: { id: "22", title: "Roast Dinner", cookTime: 90, canCook: false },
        },
    ],
    totalRecipes: 21,
    missingIngredients: 5,
    shoppingList: ["Chicken Breast", "Beef", "Fish", "Eggs", "BBQ Sauce"],
};

