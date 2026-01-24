import z from "zod";

export const PreferencesFormSchema = z.object({
	allergens: z.array(z.string()),
	dietaryPreferences: z.array(z.string()),
	spiceLevel: z.string().nullable(),
	likedFoods: z.string().nullable(),
	dislikedFoods: z.string().nullable(),
});

export type PreferencesFormInput = z.input<typeof PreferencesFormSchema>;
export type PreferencesFormOutput = z.infer<typeof PreferencesFormSchema>;
