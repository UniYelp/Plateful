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
	vegetables: "/assets/ingredientsCategories/vegetable.png",
	fruits: "/assets/ingredientsCategories/fresh-produce.png",
	meat: "/assets/ingredientsCategories/chicken.png",
	dairy: "/assets/ingredientsCategories/milk.png",
	herbs: "/assets/ingredientsCategories/tea.png",
	oils: "/assets/ingredientsCategories/oil.png",
	grains: "/assets/ingredientsCategories/cereals.png",
	other: "/assets/ingredientsCategories/salad.png",
} as const satisfies Record<IngredientCategory, string>;
