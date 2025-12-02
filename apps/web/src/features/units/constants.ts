import type { ValueOf } from "@plateful/types";
import { Unit, UnitCategory } from "./enums";
export const unitsByCategory = {
	[UnitCategory.Mass]: [Unit.Gram, Unit.Kilogram, Unit.Ounce, Unit.Pound],
	[UnitCategory.Volume]: [
		Unit.Milliliter,
		Unit.Liter,
		Unit.Teaspoon,
		Unit.Dessertspoon,
		Unit.Tablespoon,
		Unit.Cup,
	],
	[UnitCategory.Temperature]: [Unit.Celsius, Unit.Fahrenheit, Unit.Kelvin],
} as const satisfies Record<UnitCategory, Unit[]>;

export const symbolByUnit = {
	// #region Mass
	[Unit.Gram]: "g",
	[Unit.Kilogram]: "kg",
	[Unit.Ounce]: "oz",
	[Unit.Pound]: "lb",
	// #endregion
	// #region Volume
	[Unit.Milliliter]: "mL",
	[Unit.Liter]: "L",
	[Unit.Teaspoon]: "tsp",
	[Unit.Dessertspoon]: "dsp",
	[Unit.Tablespoon]: "tbsp",
	[Unit.Cup]: "cup",
	// #endregion
	// #region Temperature
	[Unit.Celsius]: "°C",
	[Unit.Fahrenheit]: "°F",
	[Unit.Kelvin]: "°K",
	// #endregion
} as const satisfies Record<Unit, string>;

export const unitSymbols = Object.values(symbolByUnit);
export type UnitSymbol = ValueOf<typeof symbolByUnit>;

export const aliasesByUnit = {
	// #region Mass
	[Unit.Gram]: ["gr"],
	// #endregion
	// #region Volume
	[Unit.Tablespoon]: ["tbs"],
	// #endregion
	// #region Temperature
	// #endregion
} as const satisfies Partial<Record<Unit, string[]>>;
