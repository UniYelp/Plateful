/// <reference types="dom-chromium-ai" />

import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import dedent from "dedent";
import z from "zod";

import { AIHint } from "&/ai/AIHint";
import { getCachedAIResult, setCachedAIResult } from "&/ai/cache";
import { aiStatusQueryOptions } from "&/ai/query";
import { AIStatus } from "&/ai/status.enum";
import { INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH } from "./constants";

export function DescriptionHint({
	ingredientName,
	isEmpty,
	onSelect,
}: {
	ingredientName?: string;
	isEmpty: boolean;
	onSelect: (description: string) => void;
}) {
	const { data: aiData } = useQuery(aiStatusQueryOptions);

	const [name] = useDebouncedValue(ingredientName, {
		wait: 1000,
	});

	const shouldEnableHint = !!(
		name?.trim() &&
		aiData?.status === AIStatus.Ready &&
		isEmpty
	);

	const { data: hint, isLoading: isGenerating } = useQuery({
		queryKey: ["DescriptionHint", name, aiData?.status],
		enabled: shouldEnableHint,
		staleTime: 60 * 60 * 1000,
		queryFn: async ({ signal }) => {
			if (!name?.trim() || aiData?.status !== AIStatus.Ready) {
				return null;
			}

			const cacheKey = `ingredient_description_hint_${name.trim().toLocaleLowerCase()}`;

			const cachedItem = getCachedAIResult({
				cacheKey,
			});

			if (cachedItem) {
				return cachedItem;
			}

			const session = await aiData.session.clone();

			const prompt = dedent`
            Suggest a short description for an ingredient named "${name}".

            The description should:
            - Be at most ${INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH} characters long
            - Describe the ingredient from the viewpoint of someone cooking with it
            - Read like a personal kitchen note or a tip a home cook would write
            - CRITICAL: Do NOT start with the name of the ingredient, and do NOT use "This ingredient is..." or similar phrases at the beginning. Start directly with the action, texture, or flavor profile.
            - Be written in plain text - no markdown, no quotes, no explanations
            - Not have a leading title

            Return ONLY the description.`;

			try {
				const response = await session.prompt(prompt, {
					signal,
				});

				const data = response
					.trim()
					.slice(0, INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH);

				setCachedAIResult({
					cacheKey,
					value: data,
				});

				return data;
			} finally {
				session.destroy();
			}
		},
	});

	if (!isEmpty) return null;

	if (isGenerating) {
		return <AIHint.Loading className="w-full max-w-[150px]" />;
	}

	if (!hint) return null;

	return (
		<AIHint
			hint={hint}
			title="AI suggested expiry date. Click to apply."
			onClick={() => onSelect(hint)}
			className="w-full max-w-[150px]"
		/>
	);
}
