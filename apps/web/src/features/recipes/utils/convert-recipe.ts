import { parse, toSeconds } from "iso8601-duration";

import {
	RecipeDurationKind,
	RecipeMaterialKind,
	RecipeStepBlockType,
} from "@plateful/recipes";
import type { Maybe } from "@plateful/types";
import type { RecipeStep, RecipeStepBlock } from "@backend/recipes";

function sumIsoDurations(durations: string[]): Maybe<string> {
	if (durations.length === 0) return null;
	if (durations.length === 1) return durations[0];

	let totalSeconds = 0;
	for (const dur of durations) {
		try {
			totalSeconds += toSeconds(parse(dur));
		} catch (e) {
			console.error("Failed to parse ISO duration:", dur, e);
		}
	}

	if (totalSeconds === 0) return null;
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	let res = "PT";
	if (hours > 0) res += `${hours}H`;
	if (minutes > 0) res += `${minutes}M`;
	if (seconds > 0 || res === "PT") res += `${seconds}S`;
	return res;
}

export function ensureV1RecipeStep(step: RecipeStep): RecipeStep {
	if (step.metadata) {
		return step;
	}

	const inlineBlocks: RecipeStepBlock[] = [];
	const setupTimes: string[] = [];
	const derivedOutputs: Array<{
		of: { id: any } | { name: string };
		quantity: any;
	}> = [];

	const { blocks } = step;

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];

		if (typeof block !== "string") {
			if (block.type === RecipeStepBlockType.Duration) {
				if (block.kind === RecipeDurationKind.Prep) {
					setupTimes.push(block.value);
					continue;
				}

				const isTrailing = blocks
					.slice(i + 1)
					.every(
						(b) =>
							(b.type === RecipeStepBlockType.Text &&
								["", ".", ".", "!", "?"].includes(b.text)) ||
							(b.type === RecipeStepBlockType.Material &&
								b.kind === RecipeMaterialKind.DerivedOutput),
					);

				if (isTrailing) {
					continue;
				}
			}

			if (block.type === RecipeStepBlockType.Material) {
				if (block.kind === RecipeMaterialKind.DerivedOutput) {
					derivedOutputs.push({
						of: block.ingredient,
						quantity: block.quantity,
					});
					continue;
				}

				if (
					block.kind === RecipeMaterialKind.Output &&
					i === blocks.length - 1
				) {
					derivedOutputs.push({
						of: block.ingredient,
						quantity: block.quantity,
					});
					continue;
				}
			}
		}

		inlineBlocks.push(block);
	}

	const setupTime = sumIsoDurations(setupTimes);

	return {
		...step,
		blocks: inlineBlocks,
		metadata: {
			priority: "mandatory",
			...(setupTime ? { setupTime } : {}),
			...(derivedOutputs.length > 0 ? { derivedOutputs } : {}),
		},
	};
}
