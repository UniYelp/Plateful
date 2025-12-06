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
	{ from: VolumeUnit.Milliliter, to: VolumeUnit.Liter, by: 1000 },
	{
		from: VolumeUnit.Teaspoon,
		to: VolumeUnit.Dessertspoon,
		by: 2,
	},
	{
		from: VolumeUnit.Teaspoon,
		to: VolumeUnit.Tablespoon,
		by: 3,
	},
	{
		from: VolumeUnit.Teaspoon,
		to: VolumeUnit.Milliliter,
		isLossy: true,
		by: 5 /** @note metric/imperial tsp | US tsp is by 4.93 */,
	},
	{
		from: VolumeUnit.Tablespoon,
		to: VolumeUnit.Milliliter,
		isLossy: true,
		by: 15 /** @note metric/imperial tsp | US tsp is by 14.79 */,
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
		by: 240,
	},
];
