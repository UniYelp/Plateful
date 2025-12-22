import z from "zod";

export const RecipeGenFormSchema = z.object({
	tags: z.array(z.string()),
	ingredients: z
		.array(z.string())
		.min(1, "Must select at least one ingredient"),
});

export type RecipeGenForm = z.infer<typeof RecipeGenFormSchema>;
