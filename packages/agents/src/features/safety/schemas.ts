import z from "zod";

export const safetyOutputSchema = z.object({
	reasoning: z.string(),
	safetyScore: z.float64().min(0).max(1),
});

export const safetyInputSchema = z.object({
	recipe: z.string(),
});

export type SafetyOutput = z.infer<typeof safetyOutputSchema>;
export type SafetyInput = z.infer<typeof safetyInputSchema>;
