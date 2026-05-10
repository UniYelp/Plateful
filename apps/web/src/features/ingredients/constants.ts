import {
	type ExpiryStatus,
	IngredientCategory,
	ingredientCategories,
} from "@plateful/ingredients";
import type { BadgeProps } from "@/components/ui/badge";

export const colorByExpiryStatus = {
	expired: "destructive",
	expiring: "destructive",
	warning: "secondary",
	good: "outline",
} as const satisfies Record<ExpiryStatus, BadgeProps["variant"]>;

export const categories = ["all", ...ingredientCategories] as const satisfies (
	| IngredientCategory
	| "all"
)[];

export type Category = (typeof categories)[number];

export const ingredientsCategoriesOptions = [
	{ value: IngredientCategory.Vegetables, label: "Vegetables" },
	{ value: IngredientCategory.Fruits, label: "Fruits" },
	{ value: IngredientCategory.Meat, label: "Meat & Poultry" },
	{ value: IngredientCategory.Seafood, label: "Seafood" },
	{ value: IngredientCategory.Dairy, label: "Dairy" },
	{ value: IngredientCategory.Breads, label: "Breads & Bakery" },
	{ value: IngredientCategory.Canned, label: "Canned Goods" },
	{ value: IngredientCategory.Baking, label: "Baking Supplies" },
	{ value: IngredientCategory.Sauces, label: "Sauces & Condiments" },
	{ value: IngredientCategory.Frozen, label: "Frozen Foods" },
	{ value: IngredientCategory.FrozenDesserts, label: "Frozen Desserts" },
	{ value: IngredientCategory.Snacks, label: "Snacks" },
	{ value: IngredientCategory.Chocolate, label: "Chocolate" },
	{ value: IngredientCategory.Candies, label: "Candies" },
	{ value: IngredientCategory.Beverages, label: "Beverages" },
	{ value: IngredientCategory.Herbs, label: "Herbs & Spices" },
	{ value: IngredientCategory.Oils, label: "Oils" },
	{ value: IngredientCategory.Grains, label: "Grains & Cereals" },
	{ value: IngredientCategory.Inedible, label: "Non-Edible / Accessories" },
	{ value: IngredientCategory.Other, label: "Other" },
] satisfies { value: IngredientCategory; label: string }[];

// TODO: add more images
export const ingredientImgByCategory = {
	[IngredientCategory.Vegetables]: "/vegetable.png",
	[IngredientCategory.Fruits]: "/fresh-produce.png",
	[IngredientCategory.Meat]: "/chicken.png",
	[IngredientCategory.Seafood]: "/salad.png",
	[IngredientCategory.Dairy]: "/milk.png",
	[IngredientCategory.Breads]: "/cereals.png",
	[IngredientCategory.Canned]: "/oil.png",
	[IngredientCategory.Baking]: "/cereals.png",
	[IngredientCategory.Sauces]: "/oil.png",
	[IngredientCategory.Frozen]: "/fresh-produce.png",
	[IngredientCategory.FrozenDesserts]: "/fresh-produce.png",
	[IngredientCategory.Snacks]: "/salad.png",
	[IngredientCategory.Chocolate]: "/salad.png",
	[IngredientCategory.Candies]: "/salad.png",
	[IngredientCategory.Beverages]: "/tea.png",
	[IngredientCategory.Herbs]: "/tea.png",
	[IngredientCategory.Oils]: "/oil.png",
	[IngredientCategory.Grains]: "/cereals.png",
	[IngredientCategory.Inedible]: "/salad.png",
	[IngredientCategory.Other]: "/salad.png",
} as const satisfies Record<IngredientCategory, string>;
