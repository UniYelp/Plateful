import z from "zod";

export const RecipeGenFormSchema = z.object({
	tags: z.array(z.string()),
	ingredients: z.array(z.string()),
});

export type RecipeGenForm = z.infer<typeof RecipeGenFormSchema>;
