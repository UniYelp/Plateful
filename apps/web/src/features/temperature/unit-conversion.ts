import { createUnitConversion } from "../units/utils";
import { temperatureConversion, temperaturesUnitsSymbols } from "./constants";

export const {
	convertUnits: convertTemperatureUnits,
	getConversions: getTemperatureUnitConversions,
} = createUnitConversion({
	units: temperaturesUnitsSymbols,
	conversions: temperatureConversion,
	getConversion: (c) => (v: number) => v * c.scale + c.offset,
	getReverseConversion: (c) => (v: number) => (v - c.offset) / c.scale,
	cost: () => 1,
	calculate: (path, initialValue: number = 1) =>
		path.costs.reduce((acc, fn) => fn(acc), initialValue),
});
