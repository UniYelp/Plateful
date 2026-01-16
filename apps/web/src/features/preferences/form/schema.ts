import z from "zod";

export const PreferencesFormSchema = z.object({
	allergens: z.array(z.string()),
	dietaryPreferences: z.array(z.string()),
	spiceLevel: z.string(),
	likedFoods: z.string(),
	dislikedFoods: z.string(),
});

export type PreferencesFormInput = z.input<typeof PreferencesFormSchema>;
export type PreferencesFormOutput = z.infer<typeof PreferencesFormSchema>;
