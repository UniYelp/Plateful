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
	{ value: IngredientCategory.Fish, label: "Fish" },
	{ value: IngredientCategory.Dairy, label: "Dairy" },
	{ value: IngredientCategory.Breads, label: "Breads & Bakery" },
	{ value: IngredientCategory.Canned, label: "Canned Goods" },
	{ value: IngredientCategory.Baking, label: "Baking Supplies" },
	{ value: IngredientCategory.Sauces, label: "Sauces & Condiments" },
	{ value: IngredientCategory.Frozen, label: "Frozen Foods" },
	{ value: IngredientCategory.Desserts, label: "Frozen Desserts" },
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

/**
 * @credit Icons from {@link https://www.flaticon.com/}
 */
export const ingredientImgByCategory = {
	[IngredientCategory.Vegetables]: "/vegetable.png",
	[IngredientCategory.Fruits]: "/fresh-produce.png",
	[IngredientCategory.Meat]: "/chicken.png",
	[IngredientCategory.Seafood]: "/seafood.png",
	[IngredientCategory.Fish]: "/seafood.png",
	[IngredientCategory.Dairy]: "/milk.png",
	[IngredientCategory.Breads]: "/breads.png",
	[IngredientCategory.Canned]: "/canned-food.png",
	[IngredientCategory.Baking]: "/bake.png",
	[IngredientCategory.Sauces]: "/sauces.png",
	[IngredientCategory.Frozen]: "/frozen-goods.png",
	[IngredientCategory.Desserts]: "/sweets.png",
	[IngredientCategory.Snacks]: "/snack.png",
	[IngredientCategory.Chocolate]: "/chocolate.png",
	[IngredientCategory.Candies]: "/candy.png",
	[IngredientCategory.Beverages]: "/beverages.png",
	[IngredientCategory.Herbs]: "/tea.png",
	[IngredientCategory.Oils]: "/oil.png",
	[IngredientCategory.Grains]: "/cereals.png",
	[IngredientCategory.Inedible]: "/bakery.png",
	[IngredientCategory.Other]: "/salad.png",
} as const satisfies Record<IngredientCategory, string>;
