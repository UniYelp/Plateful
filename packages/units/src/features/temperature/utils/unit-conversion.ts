import { unitConversion } from "../../../utils";
import { temperatureConversions } from "../constants";
import { temperatureSymbols } from "../enums";

export const {
	convertUnits: convertTemperatureUnits,
	getConversions: getTemperatureUnitConversions,
} = unitConversion({
	units: temperatureSymbols,
	conversions: temperatureConversions,
	getConversion: (c) => (v: number) => v * c.scale + c.offset,
	getReverseConversion: (c) => (v: number) => (v - c.offset) / c.scale,
	cost: () => 1,
	calculate: (res, initialValue: number = 1) =>
		res.conversions.reduce((acc, fn) => fn(acc), initialValue),
});
