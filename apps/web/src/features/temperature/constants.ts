import { symbolByUnit, unitsByCategory } from "../units/constants";
import { UnitCategory } from "../units/enums";
import type { UnitConversion } from "../units/types";

const CELSIUS_TO_KELVIN_OFFSET = 273.15;
const FAHRENHEIT_OFFSET = 32;
const FAHRENHEIT_SCALE = 9 / 5;

const temperaturesUnits = unitsByCategory[UnitCategory.Temperature];

export const temperaturesUnitsSymbols = temperaturesUnits.map(
	(unit) => symbolByUnit[unit],
);

type TemperaturesUnitSymbols = (typeof temperaturesUnitsSymbols)[number];

type TemperatureUnitConversion = UnitConversion<
	{ scale: number; offset: number },
	TemperaturesUnitSymbols
>;

export const temperatureConversion: TemperatureUnitConversion[] = [
	{
		from: "°C",
		to: "°K",
		scale: 1,
		offset: CELSIUS_TO_KELVIN_OFFSET,
	},
	{
		from: "°C",
		to: "°F",
		scale: FAHRENHEIT_SCALE,
		offset: FAHRENHEIT_OFFSET,
	},
];
