import { RecipeMaterialKind } from "@plateful/recipes";
import { Arr, bool } from "@plateful/utils";
import type { Id } from "@backend/dataModel";
import type {
	MaterialBlock,
	RecipeStep,
	RecipeStepBlock,
} from "@backend/recipes";
import { formatDuration } from "./format-duration";
import { formatQuantity } from "./format-quantity";

export const formatStep = (
	step: RecipeStep,
	ingredientNameById: Record<Id<"ingredients">, string>,
): string => {
	const { blocks } = step;

	return blocks
		.map((block, idx) =>
			formatStepBlock(block, ingredientNameById, idx === blocks.length - 1),
		)
		.join("");
};

const formatStepBlock = (
	block: RecipeStepBlock,
	ingredientNameById: Record<Id<"ingredients">, string>,
	isLastBlock: boolean,
): string => {
	if (typeof block === "string") return block;

	switch (block.type) {
		case "text": {
			return block.text;
		}
		case "action": {
			return block.action;
		}
		case "tool": {
			return block.name;
		}
		case "duration": {
			if (block.kind === "prep" && isLastBlock) return "";
			return formatDuration(block.value);
		}
		case "temperature": {
			const formatter = new Intl.NumberFormat("en-US", {
				style: "unit",
				unit: block.unit,
			});

			return formatter.format(block.value);
		}
		case "material": {
			return formatMaterialBlock(block, ingredientNameById);
		}
		default: {
			const _exhaustive: never = block;
			return _exhaustive;
		}
	}
};

const formatMaterialBlock = (
	data: MaterialBlock,
	nameById: Record<Id<"ingredients">, string | undefined>,
) => {
	if (
		Arr.includes(
			[RecipeMaterialKind.DerivedOutput, RecipeMaterialKind.Output],
			data.kind,
		)
	) {
		return "";
	}

	const userLocale = undefined;

	const name =
		"name" in data.ingredient
			? data.ingredient.name
			: nameById[data.ingredient.id];

	const qtyStr =
		typeof data.quantity === "string"
			? data.quantity
			: formatQuantity(data.quantity);

	const parts = [
		qtyStr,
		// data.state,
		name?.toLocaleLowerCase() || "unknown",
	].filter(bool);

	const formattedStr = new Intl.ListFormat(userLocale, {
		style: "narrow",
		type: "unit",
	}).format(parts);

	return formattedStr;
};
