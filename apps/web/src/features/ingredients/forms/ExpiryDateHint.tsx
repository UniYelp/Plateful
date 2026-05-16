/// <reference types="dom-chromium-ai" />

import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import z from "zod";

import { AIHint } from "&/ai/AIHint";
import { getCachedAIResult, setCachedAIResult } from "&/ai/cache";
import { aiStatusQueryOptions } from "&/ai/query";
import { AIStatus } from "&/ai/status.enum";
import { expiryDateHintPrompt } from "../ai/prompts";

const ExpiryDateHintResponseSchema = z.object({
	estimatedExpiryDate: z.iso.date().nullable().meta({
		description:
			"Return NULL if the ingredient does not realistically expire (like salt, sugar, water) or its expiry is decades away",
	}),
});

const ExpiryDateHintResponseJsonSchema =
	ExpiryDateHintResponseSchema.toJSONSchema();

type ExpiryDateHintResponse = z.infer<typeof ExpiryDateHintResponseSchema>;

export function ExpiryDateHint({
	ingredientName,
	currentExpiry,
	onSelect,
}: {
	ingredientName?: string;
	currentExpiry?: string | null;
	onSelect: (date: string) => void;
}) {
	const { data: aiData } = useQuery(aiStatusQueryOptions);

	const [name] = useDebouncedValue(ingredientName, {
		wait: 1000,
	});

	const shouldEnableHint = !!(
		name?.trim() &&
		aiData?.status === AIStatus.Ready &&
		!currentExpiry
	);

	const { data: hint, isLoading: isGenerating } = useQuery({
		queryKey: ["ExpiryDateHint", name, aiData?.status],
		enabled: shouldEnableHint,
		staleTime: 60 * 60 * 1000,
		queryFn: async ({ signal }) => {
			if (!name?.trim() || aiData?.status !== AIStatus.Ready) {
				return null;
			}

			const cacheKey = `ingredient_expiry_date_hint_${name.trim().toLocaleLowerCase()}`;

			const cachedItem = getCachedAIResult({
				cacheKey,
				schema: ExpiryDateHintResponseSchema.shape.estimatedExpiryDate,
			});

			if (cachedItem) {
				return cachedItem;
			}

			const session = await aiData.session.clone();

			const today = new Date().toISOString().split("T")[0];
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			const prompt = expiryDateHintPrompt({
				name: name.trim(),
				today,
				timezone,
			});

			try {
				const response = await session.prompt(prompt, {
					responseConstraint: ExpiryDateHintResponseJsonSchema,
					signal,
				});

				const { estimatedExpiryDate } = JSON.parse(
					response,
				) as ExpiryDateHintResponse;

				setCachedAIResult({
					cacheKey,
					value: estimatedExpiryDate,
				});

				return estimatedExpiryDate;
			} finally {
				session.destroy();
			}
		},
	});

	if (currentExpiry) return null;

	if (isGenerating) {
		return (
			<AIHint.Loading className="-translate-y-1/2 absolute top-1/2 right-12 z-10 min-w-[100px]" />
		);
	}

	if (!hint) return null;

	return (
		<AIHint
			hint={hint}
			title="AI suggested expiry date. Click to apply."
			onClick={() => onSelect(hint)}
			className="-translate-y-1/2 absolute top-1/2 right-12 z-10"
		/>
	);
}
