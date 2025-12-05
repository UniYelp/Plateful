import type { ScalarUnitConversion } from "../scalar";
import { MassUnit } from "./enums";

export const aliasesByMassUnit = {
	[MassUnit.Gram]: ["gr"],
} as const satisfies Partial<Record<MassUnit, string[]>>;

/**
 * ? Prefer conversions from a "lower" unit to an "upper" unit (>=1)
 */
export const massUnitConversions: ScalarUnitConversion<MassUnit>[] = [
	{
		from: MassUnit.Gram,
		to: MassUnit.Kilogram,
		by: 1000,
	},
	{ from: MassUnit.Ounce, to: MassUnit.Gram, by: 28.35, isLossy: true },
	{ from: MassUnit.Pound, to: MassUnit.Ounce, by: 16 },
];
