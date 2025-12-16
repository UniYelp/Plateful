import { unitConversion } from "../../../utils";
import { temperatureConversions } from "../constants";
import { type TemperatureUnit, temperatureUnits } from "../enums";

export const temperatureUnitConversion = (
	unitsConfig?: Readonly<Record<TemperatureUnit, boolean>>,
) =>
	unitConversion({
		units: unitsConfig
			? temperatureUnits.filter((value) => unitsConfig[value] !== false)
			: temperatureUnits,
		conversions: temperatureConversions,
		getConversion: (c) => (v: number) => v * c.scale + c.offset,
		getReverseConversion: (c) => (v: number) => (v - c.offset) / c.scale,
		cost: () => 1,
		calculate: (res, initialValue: number = 1) =>
			res.conversions.reduce((acc, fn) => fn(acc), initialValue),
	});
