import { CheckCircle2, Clock } from "lucide-react";
import { useMemo } from "react";

import {
	convertIngredientUnits,
	getIngredientUnitConversions,
	type IngredientUnit,
} from "@plateful/ingredients";
import { RecipeMaterialKind } from "@plateful/recipes";
import { Arr } from "@plateful/utils";
import type { Id } from "@backend/dataModel";
import type {
	MaterialBlock,
	RecipeStep,
	RecipeStepBlock,
} from "@backend/recipes";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration } from "../utils/format-duration";
import { formatQuantity } from "../utils/format-quantity";

const MaxRatioForDisplay = 1000;

export const RecipeStepContent = ({
	step,
	ingredientNameById,
}: {
	step: RecipeStep;
	ingredientNameById: Record<Id<"ingredients">, string>;
}) => {
	const { blocks } = step;

	const inlineBlocks: RecipeStepBlock[] = [];
	const adornmentBlocks: RecipeStepBlock[] = [];

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];

		if (typeof block !== "string") {
			if (block.type === "duration") {
				if (block.kind === "prep") {
					adornmentBlocks.push(block);
					continue;
				}

				const isTrailing = blocks
					.slice(i + 1)
					.every(
						(b) =>
							(b.type === "text" && b.text.trim() === "") ||
							(b.type === "material" &&
								b.kind === RecipeMaterialKind.DerivedOutput),
					);

				if (isTrailing) {
					adornmentBlocks.push(block);
					continue;
				}
			}

			if (block.type === "material") {
				if (block.kind === RecipeMaterialKind.DerivedOutput) {
					adornmentBlocks.push(block);
					continue;
				}

				if (
					block.kind === RecipeMaterialKind.Output &&
					i === blocks.length - 1
				) {
					adornmentBlocks.push(block);
					continue;
				}
			}
		}

		inlineBlocks.push(block);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="leading-loose">
				{inlineBlocks.map((block, idx) => (
					<StepBlock
						key={idx}
						block={block}
						ingredientNameById={ingredientNameById}
					/>
				))}
			</div>
			{adornmentBlocks.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{adornmentBlocks.map((block, idx) => (
						<StepAdornment
							key={`adornment-${idx}`}
							block={block}
							ingredientNameById={ingredientNameById}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const StepAdornment = ({
	block,
	ingredientNameById,
}: {
	block: RecipeStepBlock;
	ingredientNameById: Record<Id<"ingredients">, string>;
}) => {
	if (typeof block === "string") return null;

	if (block.type === "duration") {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-xs">
				<Clock className="h-3 w-3" />
				Time: {formatDuration(block.value)}
			</span>
		);
	}

	if (block.type === "material") {
		const name =
			"name" in block.ingredient
				? block.ingredient.name
				: ingredientNameById[block.ingredient.id];

		return (
			<span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
				<CheckCircle2 className="h-3 w-3" />
				Yields: {name}
			</span>
		);
	}

	return null;
};

const StepBlock = ({
	block,
	ingredientNameById,
}: {
	block: RecipeStepBlock;
	ingredientNameById: Record<Id<"ingredients">, string>;
}) => {
	if (typeof block === "string") return <span>{block}</span>;

	switch (block.type) {
		case "text":
			return <span>{block.text}</span>;
		case "action":
			return <span>{block.action}</span>;
		case "tool":
			return (
				<span className="mx-0.5 inline-flex items-center rounded-md bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 px-1.5 py-0.5 align-baseline font-semibold text-white text-xs shadow-sm">
					{block.name}
				</span>
			);
		case "duration":
			return <span>{formatDuration(block.value)}</span>;
		case "temperature": {
			const formatter = new Intl.NumberFormat("en-US", {
				style: "unit",
				unit: block.unit,
			});
			return <span>{formatter.format(block.value)}</span>;
		}
		case "material":
			return <MaterialBlockView data={block} nameById={ingredientNameById} />;
		default:
			return null;
	}
};

const MaterialBlockView = ({
	data,
	nameById,
}: {
	data: MaterialBlock;
	nameById: Record<Id<"ingredients">, string | undefined>;
}) => {
	if (Arr.includes([RecipeMaterialKind.DerivedOutput], data.kind)) {
		return null;
	}

	return <InputMaterialBlockView data={data} nameById={nameById} />;
};

const InputMaterialBlockView = ({
	data,
	nameById,
}: {
	data: MaterialBlock;
	nameById: Record<Id<"ingredients">, string | undefined>;
}) => {
	const name =
		"name" in data.ingredient
			? data.ingredient.name
			: nameById[data.ingredient.id];

	const qtyObj = typeof data.quantity === "object" ? data.quantity : null;
	const qtyStr =
		typeof data.quantity === "string"
			? data.quantity
			: formatQuantity(data.quantity);

	const possibleConversions = useMemo(() => {
		if (!qtyObj || !qtyObj.unit) return [];
		const conversions = getIngredientUnitConversions(qtyObj.unit);

		return conversions.flatMap((toUnit) => {
			if (toUnit === qtyObj.unit) return [];

			const result = convertIngredientUnits(
				qtyObj.unit as IngredientUnit,
				toUnit as IngredientUnit,
				qtyObj.amount,
			);

			if (!result) return [];

			const ratio = Math.max(
				result.value / qtyObj.amount,
				qtyObj.amount / result.value,
			);

			if (ratio > MaxRatioForDisplay) return [];

			return { unit: toUnit, amount: result.value, isLossy: result.isLossy };
		});
	}, [qtyObj]);

	const formattedName = name?.toLocaleLowerCase() || "unknown";

	return (
		<span className="mx-0.5 inline items-center">
			{qtyObj && possibleConversions.length > 0 ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="mr-1 cursor-help font-medium text-primary underline decoration-dotted underline-offset-4 transition-colors hover:text-primary/80">
							{qtyStr}
						</span>
					</TooltipTrigger>
					<TooltipContent side="top" className="max-w-[200px]">
						<div className="text-xs">
							<p className="mb-1.5 border-b pb-1 font-semibold">Conversions</p>
							<ul className="space-y-1">
								{possibleConversions.map((conversion) => (
									<li
										key={conversion.unit}
										className="flex justify-between gap-3"
									>
										<span className="text-muted-foreground">
											{conversion.unit}:
										</span>
										<span className="font-medium">
											{formatQuantity({
												unit: conversion.unit,
												amount: conversion.amount,
											})}
											{conversion.isLossy ? " (~)" : ""}
										</span>
									</li>
								))}
							</ul>
						</div>
					</TooltipContent>
				</Tooltip>
			) : (
				<span className="mr-1 cursor-not-allowed font-medium text-primary">
					{qtyStr}
				</span>
			)}
			<span className="inline-flex items-center rounded-md bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 px-1.5 py-0.5 align-baseline font-semibold text-white text-xs shadow-sm">
				{formattedName}
			</span>
		</span>
	);
};
