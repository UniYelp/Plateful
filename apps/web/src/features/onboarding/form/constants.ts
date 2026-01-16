import type { OnboardingFormInput } from "./schema";

export const COMMON_ALLERGENS = [
	"Dairy",
	"Eggs",
	"Fish",
	"Shellfish",
	"Nuts",
	"Wheat",
	"Soy",
	"Sesame",
	"Gluten",
];

export const SPICE_LEVELS = [
	{ value: "no-spice", label: "No Spice", emoji: "🥛", desc: "Keep it cool" },
	{ value: "mild", label: "Mild", emoji: "🌶️", desc: "Just a hint" },
	{ value: "medium", label: "Medium", emoji: "🌶️🌶️", desc: "Perfect balance" },
	{ value: "hot", label: "Hot", emoji: "🌶️🌶️🌶️", desc: "Bring the heat" },
	{
		value: "very-hot",
		label: "Very Hot",
		emoji: "🌶️🌶️🌶️🌶️",
		desc: "Fire in the hole",
	},
];

export const QUICK_FEATURES = [
	{
		icon: "🥗",
		title: "Personalized Recipes",
		description: "Just for you",
	},
	{
		icon: "🛡️",
		title: "Allergen Safe",
		description: "Stay protected",
	},
	{
		icon: "⚡",
		title: "Quick & Easy",
		description: "Save time",
	},
];

export const DIETARY_OPTIONS = [
	"vegetarian",
	"vegan",
	"pescatarian",
	"halal",
	"kosher",
	"low-Carb",
	"keto",
	"paleo",
];

export const DEFAULT_VALUES : OnboardingFormInput = {
	allergens: [] as string[],
	spiceLevel: "medium",
	likedFoods: "",
	dislikedFoods: "",
	dietaryPreferences: [] as string[],
};