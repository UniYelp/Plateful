import type { ScalarUnitConversion } from "../scalar";
import { FoodUnit } from "./enums";

export const aliasesByVolumeUnit = {
	[FoodUnit.Tablespoon]: ["tbs"],
} as const satisfies Partial<Record<FoodUnit, string[]>>;

/**
 * ? Prefer conversions from a "lower" unit to an "upper" unit (>=1)
 *
 * TODO: US_{UNIT} and METRIC_{UNIT} w/ extra field?
 */
export const volumeUnitConversions: ScalarUnitConversion<FoodUnit>[] = [
	{ from: FoodUnit.Milliliter, to: FoodUnit.Liter, by: 1000 },
	{
		from: FoodUnit.Teaspoon,
		to: FoodUnit.Dessertspoon,
		by: 2,
	},
	{
		from: FoodUnit.Teaspoon,
		to: FoodUnit.Tablespoon,
		by: 3,
	},
	{
		from: FoodUnit.Teaspoon,
		to: FoodUnit.Milliliter,
		isLossy: true,
		by: 5 /** @note metric/imperial tsp | US tsp is by 4.93 */,
	},
	{
		from: FoodUnit.Tablespoon,
		to: FoodUnit.Milliliter,
		isLossy: true,
		by: 15 /** @note metric/imperial tsp | US tsp is by 14.79 */,
	},
	{
		from: FoodUnit.Cup,
		to: FoodUnit.Tablespoon,
		isLossy: true,
		by: 16 /** @note metric/imperial tsp | US tsp is by 14.79 */,
	},
	{
		from: FoodUnit.Cup,
		to: FoodUnit.Milliliter,
		by: 240,
	},
];
