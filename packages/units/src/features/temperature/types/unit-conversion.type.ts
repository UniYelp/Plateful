import type { UnitConversion } from "../../../types";
import type { TemperatureUnit } from "../enums";

export type TemperatureUnitConversion = UnitConversion<
	{ scale: number; offset: number },
	TemperatureUnit
>;
