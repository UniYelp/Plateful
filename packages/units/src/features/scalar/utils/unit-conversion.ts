import type { UnitConversion } from "../../../types";
import { unitConversion } from "../../../utils";
import type { ScalarUnitConversion } from "../types";

const LossyConversionCostPenalty = 0.5;

export const scalarUnitConversion = <
	TUnitConversion extends UnitConversion<ScalarUnitConversion, UnitSymbol>,
	UnitSymbol extends string = string,
>(
	units: readonly UnitSymbol[],
	conversions: readonly TUnitConversion[],
) =>
	unitConversion({
		units,
		conversions,
		getConversion: ({ by, isLossy }) => ({ by, isLossy }),
		getReverseConversion: ({ by, isLossy }) => ({ by: 1 / by, isLossy }),
		cost: (data) => 1 + (data.isLossy ? LossyConversionCostPenalty : 0),
		calculate: (res, initialValue: number = 1) => {
			let isLossy = false;
			let value = initialValue;

			for (const conversion of res.conversions) {
				value *= conversion.by;

				if (conversion.isLossy) {
					isLossy = true;
				}
			}

			return { value, isLossy };
		},
	});
