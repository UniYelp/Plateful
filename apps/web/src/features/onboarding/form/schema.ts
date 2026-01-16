import z from "zod";


export const OnboardingFormSchema = z.object({
    allergens: z.array(z.string()),
	dietaryPreferences: z.array(z.string()),
	spiceLevel: z.string(),
	likedFoods: z.string(),
	dislikedFoods: z.string(),
});

export type OnboardingFormInput = z.input<typeof OnboardingFormSchema>;
export type OnboardingFormOutput = z.infer<typeof OnboardingFormSchema>;
