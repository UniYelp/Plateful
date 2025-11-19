import { symbolByUnit, unitsByCategory } from "&/units/constants";
import { UnitCategory } from "&/units/enums";
import type { UnitConversion } from "@/features/units/types/unit-conversion.type";

const ingredientsUnits = [
	...unitsByCategory[UnitCategory.Mass],
	...unitsByCategory[UnitCategory.Volume],
] as const;

export const ingredientsUnitsSymbols = ingredientsUnits.map(
	(unit) => symbolByUnit[unit],
);

type IngredientsUnitSymbols = (typeof ingredientsUnitsSymbols)[number];

type IngredientsUnitConversion = UnitConversion<
	{ by: number },
	IngredientsUnitSymbols
>;

/**
 * ? Prefer conversions from a "lower" unit to an "upper" unit (>=1)
 */
export const ingredientsUnitConversions: IngredientsUnitConversion[] = [
	{
		from: "g",
		to: "kg",
		by: 1000,
	},
	{ from: "mL", to: "L", by: 1000 },
	{ from: "oz", to: "g", by: 28.3495 },
];
