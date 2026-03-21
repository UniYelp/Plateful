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

export const ingredientImgByCategory = {
	vegetables: "/vegetable.png",
	fruits: "/fresh-produce.png",
	meat: "/chicken.png",
	dairy: "/milk.png",
	herbs: "/tea.png",
	oils: "/oil.png",
	grains: "/cereals.png",
	other: "/salad.png",
} as const satisfies Record<IngredientCategory, string>;
