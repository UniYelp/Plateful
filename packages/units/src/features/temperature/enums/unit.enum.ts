import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const TemperatureUnit = {
	Celsius: "celsius",
	Fahrenheit: "fahrenheit",
	Kelvin: "kelvin",
} as const;

export type TemperatureUnit = ValueOf<typeof TemperatureUnit>;

export const temperatureUnits = Enum.toTuple(TemperatureUnit);
