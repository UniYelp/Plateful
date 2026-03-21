import type { ExpiryStatus } from "@plateful/ingredients";
import type { BadgeProps } from "@/components/ui/badge";

export const colorByExpiryStatus = {
	expired: "destructive",
	expiring: "destructive",
	warning: "secondary",
	good: "outline",
} as const satisfies Record<ExpiryStatus, BadgeProps["variant"]>;

export const categories = [
	"all",
	"vegetables",
	"fruits",
	"meat",
	"dairy",
	"herbs",
	"oils",
	"grains",
] as const;

export type Category = (typeof categories)[number];

export type IngredientCategory = Exclude<Category, "all"> | "other";

export const ingredientsCategoriesOptions = [
	{ value: "vegetables", label: "Vegetables" },
	{ value: "fruits", label: "Fruits" },
	{ value: "meat", label: "Meat & Poultry" },
	{ value: "dairy", label: "Dairy" },
	{ value: "herbs", label: "Herbs & Spices" },
	{ value: "oils", label: "Oils & Condiments" },
	{ value: "grains", label: "Grains & Cereals" },
	{ value: "other", label: "Other" },
] satisfies { value: IngredientCategory; label: string }[];

import cerealsImg from "@/assets/ingredientsCategories/cereals.png";
import chickenImg from "@/assets/ingredientsCategories/chicken.png";
import freshProduceImg from "@/assets/ingredientsCategories/fresh-produce.png";
import milkImg from "@/assets/ingredientsCategories/milk.png";
import oilImg from "@/assets/ingredientsCategories/oil.png";
import saladImg from "@/assets/ingredientsCategories/salad.png";
import teaImg from "@/assets/ingredientsCategories/tea.png";
import vegetableImg from "@/assets/ingredientsCategories/vegetable.png";

export const ingredientImgByCategory = {
	vegetables: vegetableImg,
	fruits: freshProduceImg,
	meat: chickenImg,
	dairy: milkImg,
	herbs: teaImg,
	oils: oilImg,
	grains: cerealsImg,
	other: saladImg,
} as const satisfies Record<IngredientCategory, string>;

