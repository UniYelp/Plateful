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
	// #region Mass
	{
		from: "g",
		to: "kg",
		by: 1000,
	},
	{ from: "oz", to: "g", by: 28.3495 },
	{ from: "lb", to: "oz", by: 16 },
	// #endregion
	// #region Volume
	{ from: "mL", to: "L", by: 1000 },
	{
		from: "tsp",
		to: "dsp",
		by: 2,
	},
	{
		from: "tsp",
		to: "tbsp",
		by: 3,
	},
	{
		from: "tsp",
		to: "mL",
		by: 5 /** @note metric/imperial tsp | US tsp is by 4.93 */,
	},
	{
		from: "tbsp",
		to: "mL",
		by: 15 /** @note metric/imperial tsp | US tsp is by 14.79 */,
	},
	{
		from: "cup",
		to: "tbsp",
		by: 16 /** @note metric/imperial tsp | US tsp is by 14.79 */,
	},
	{
		from: "cup",
		to: "mL",
		by: 240,
	},
	// #endregion
	// #region Temperature
	// #endregion
];
