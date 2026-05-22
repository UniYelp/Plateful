import z from "zod";

export const SafetyIssueSchema = z.object({
	reasoning: z.string(),
	severity: z.enum(["high", "critical"]),
});

export const SafetyInstructionSchema = z.any();

export const SafetyOutputSchema = z.object({
	reasoning: z.string(),
	safetyScore: z.float64().min(0).max(1),
});

export const SafetyInputSchema = z.object({
	recipe: z.string(),
});

export type SafetyOutput = z.infer<typeof SafetyOutputSchema>;
export type SafetyInput = z.infer<typeof SafetyInputSchema>;
