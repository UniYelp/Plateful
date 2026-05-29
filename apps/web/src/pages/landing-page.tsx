import {
	Camera,
	ChefHat,
	Receipt,
	ShoppingCart,
	Sliders,
	Utensils,
	// Commented out unused icons
	// Calendar,
	// Clock,
	// Star,
	// Users,
} from "lucide-react";

export type Feature = {
	Icon: (props: { className: string }) => React.ReactElement;
	title: string;
	description: string;
	info: string[];
};

export type Stage = {
	title: string;
	description: string;
};

export const SectionHash = {
	Features: "features",
	HowItWorks: "how-it-works",
} as const;

export const features: Feature[] = [
	{
		title: "Smart Ingredient Tracking",
		description:
			"Keep track of what you have at home with detailed expiry dates, quantities, and categories.",
		Icon: ({ className }) => <ShoppingCart className={className} />,
		info: [
			"Visual ingredient library",
			"Expiry date tracking",
			"Quantity management",
		],
	},
	{
		title: "Personalized Recipes",
		description:
			"Create recipes from your available ingredients with AI-powered suggestions, custom requests, and smart substitutions.",
		Icon: ({ className }) => <ChefHat className={className} />,
		info: [
			"Recipe creation in under 1 minute",
			"AI-powered custom requests",
			"Step-by-step guidance",
		],
	},
	{
		title: "AI-Powered Receipt Scanner",
		description:
			"Snap a photo of grocery receipts to instantly upload ingredients, quantities, and categories to your inventory.",
		Icon: ({ className }) => <Receipt className={className} />,
		info: [
			"Instant receipt parsing",
			"Automatic quantity detection",
			"Auto-categorization of items",
		],
	},
	{
		title: "Dietary & Allergen Preferences",
		description:
			"Customize your cooking experience with profiles for dietary preferences, allergies, liked/disliked foods, and spice levels.",
		Icon: ({ className }) => <Sliders className={className} />,
		info: [
			"Allergen profiling",
			"Dietary restrictions setup",
			"Ingredient likes & dislikes",
		],
	},
	{
		title: "Smart Portion Management",
		description:
			"Scale recipes dynamically to fit your available portions, and automatically deduct used items from your pantry.",
		Icon: ({ className }) => <Utensils className={className} />,
		info: [
			"Auto ingredient deduction",
			"Dynamic portion scaling",
			"Pantry availability checks",
		],
	},
	{
		title: "AI Recipe Visuals",
		description:
			"Visualize your dishes before cooking with automatically generated, high-quality images for every new recipe.",
		Icon: ({ className }) => <Camera className={className} />,
		info: [
			"Realistic food previews",
			"Background image generation",
			"Visual recipe catalog",
		],
	},
	/* Commented out for future implementation
    {
		title: "Household Management",
		description:
			"Share ingredients and recipes with family members in organized households.",
		Icon: ({ className }) => <Users className={className} />,
		info: [
			"Multi-user households",
			"Shared ingredient pantry",
			"Family recipe collection",
		],
	},
	{
		title: "Meal Planning",
		description:
			"Plan your meals for the week with automatic shopping list generation.",
		Icon: ({ className }) => <Calendar className={className} />,
		info: ["Weekly meal plans", "Flexible scheduling", "Auto shopping lists"],
	},
	{
		title: "Time-Saving Features",
		description:
			"Streamline your cooking process with smart automation and quick actions.",
		Icon: ({ className }) => <Clock className={className} />,
		info: [
			"Auto ingredient deduction",
			"Quick recipe recreation",
			"Smart notifications",
		],
	},
	{
		title: "Recipe Intelligence",
		description:
			"Get cooking insights, difficulty ratings, and dietary information for every recipe.",
		Icon: ({ className }) => <Star className={className} />,
		info: ["Difficulty ratings", "Cooking time estimates", "Dietary tags"],
	},
	*/
];

export const stages: Stage[] = [
	{
		title: "Add Your Ingredients",
		description:
			"Quickly catalog what you have at home with photos, quantities, and expiry dates.",
	},
	{
		title: "Discover Recipes",
		description:
			"Get personalized recipe suggestions based on your available ingredients.",
	},
	{
		title: "Cook & Enjoy",
		description:
			"Follow step-by-step instructions and let us handle the ingredient tracking.",
	},
];
