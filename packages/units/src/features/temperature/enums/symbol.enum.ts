import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";
import { TemperatureUnit } from "./unit.enum";

export const TemperatureSymbol = {
	[TemperatureUnit.Celsius]: "°C",
	[TemperatureUnit.Fahrenheit]: "°F",
	[TemperatureUnit.Kelvin]: "°K",
} as const satisfies Record<TemperatureUnit, string>;

export type TemperatureSymbol = ValueOf<typeof TemperatureSymbol>;

export const temperatureSymbols = Enum.toTuple(TemperatureSymbol);
