import type { ScalarUnitConversion } from "../scalar";
import { VolumeUnit } from "./enums";

export const aliasesByVolumeUnit = {
	[VolumeUnit.Tablespoon]: ["tbs"],
} as const satisfies Partial<Record<VolumeUnit, string[]>>;

/**
 * ? Prefer conversions from a "lower" unit to an "upper" unit (>=1)
 *
 * TODO: US_{UNIT} and METRIC_{UNIT} w/ extra field?
 */
export const volumeUnitConversions: ScalarUnitConversion<VolumeUnit>[] = [
	{ from: VolumeUnit.Liter, to: VolumeUnit.Milliliter, by: 1000 },
	{
		from: VolumeUnit.Dessertspoon,
		to: VolumeUnit.Teaspoon,
		by: 2 /** @note metric/imperial tsp | US tsp is by 4.93 */,
	},
	{
		from: VolumeUnit.Tablespoon,
		to: VolumeUnit.Teaspoon,
		by: 3 /** @note metric/imperial tsp | US tsp is by 4.93 */,
	},
	{
		from: VolumeUnit.Teaspoon,
		to: VolumeUnit.Milliliter,
		isLossy: true,
		by: 5.93 /** @note metric/imperial tsp | US tsp is by 4.93 */,
	},
	{
		from: VolumeUnit.Tablespoon,
		to: VolumeUnit.Milliliter,
		isLossy: true,
		by: 17.76 /** @note metric/imperial tsp | US tsp is by 14.79 */,
	},
	{
		from: VolumeUnit.Cup,
		to: VolumeUnit.Tablespoon,
		isLossy: true,
		by: 16 /** @note metric/imperial tsp | US tsp is by 14.79 */,
	},
	{
		from: VolumeUnit.Cup,
		to: VolumeUnit.Milliliter,
		isLossy: true,
		by: 284.131 /** @note metric/imperial tsp | US tsp is by 4.93 */,
	},
];
