import { TemperatureUnit } from "./enums";
import type { TemperatureUnitConversion } from "./types";

const CELSIUS_TO_KELVIN_OFFSET = 273.15;
const FAHRENHEIT_OFFSET = 32;
const FAHRENHEIT_SCALE = 9 / 5;

export const aliasesByTemperatureUnit = {} as const satisfies Partial<
	Record<TemperatureUnit, string[]>
>;

export const temperatureConversions: TemperatureUnitConversion[] = [
	{
		from: TemperatureUnit.Celsius,
		to: TemperatureUnit.Kelvin,
		scale: 1,
		offset: CELSIUS_TO_KELVIN_OFFSET,
	},
	{
		from: TemperatureUnit.Celsius,
		to: TemperatureUnit.Fahrenheit,
		scale: FAHRENHEIT_SCALE,
		offset: FAHRENHEIT_OFFSET,
	},
];
