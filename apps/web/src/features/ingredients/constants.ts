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
	{ value: IngredientCategory.Dairy, label: "Dairy" },
	{ value: IngredientCategory.Breads, label: "Breads & Bakery" },
	{ value: IngredientCategory.Baking, label: "Baking Supplies" },
	{ value: IngredientCategory.Beverages, label: "Beverages" },
	{ value: IngredientCategory.Candies, label: "Candies" },
	{ value: IngredientCategory.Canned, label: "Canned Goods" },
	{ value: IngredientCategory.Chocolate, label: "Chocolate" },
	{ value: IngredientCategory.Desserts, label: "Frozen Desserts" },
	{ value: IngredientCategory.Fish, label: "Fish" },
	{ value: IngredientCategory.Frozen, label: "Frozen Foods" },
	{ value: IngredientCategory.Grains, label: "Grains & Cereals" },
	{ value: IngredientCategory.Herbs, label: "Herbs & Spices" },
	{ value: IngredientCategory.Inedible, label: "Non-Edible / Accessories" },
	{ value: IngredientCategory.Oils, label: "Oils" },
	{ value: IngredientCategory.Sauces, label: "Sauces & Condiments" },
	{ value: IngredientCategory.Seafood, label: "Seafood" },
	{ value: IngredientCategory.Snacks, label: "Snacks" },
	{ value: IngredientCategory.Other, label: "Other" },
] satisfies { value: IngredientCategory; label: string }[];

/**
 * @credit Icons from {@link https://www.flaticon.com/}
 */
export const ingredientImgByCategory = {
	[IngredientCategory.Vegetables]: "/vegetable.png",
	[IngredientCategory.Fruits]: "/fresh-produce.png",
	[IngredientCategory.Meat]: "/chicken.png",
	[IngredientCategory.Dairy]: "/milk.png",
	[IngredientCategory.Breads]: "/breads.png",
	[IngredientCategory.Baking]: "/bake.png",
	[IngredientCategory.Beverages]: "/beverages.png",
	[IngredientCategory.Candies]: "/candy.png",
	[IngredientCategory.Canned]: "/canned-food.png",
	[IngredientCategory.Chocolate]: "/chocolate.png",
	[IngredientCategory.Desserts]: "/sweets.png",
	[IngredientCategory.Fish]: "/seafood.png",
	[IngredientCategory.Frozen]: "/frozen-goods.png",
	[IngredientCategory.Grains]: "/cereals.png",
	[IngredientCategory.Herbs]: "/tea.png",
	[IngredientCategory.Inedible]: "/bakery.png",
	[IngredientCategory.Oils]: "/oil.png",
	[IngredientCategory.Sauces]: "/sauces.png",
	[IngredientCategory.Seafood]: "/seafood.png",
	[IngredientCategory.Snacks]: "/snack.png",
	[IngredientCategory.Other]: "/salad.png",
} as const satisfies Record<IngredientCategory, string>;
