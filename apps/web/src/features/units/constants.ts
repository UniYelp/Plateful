import type { ValueOf } from "@plateful/types";
import { Unit, UnitCategory } from "./enums";
export const unitsByCategory = {
	[UnitCategory.Mass]: [Unit.Gram, Unit.Kilogram, Unit.Ounce],
	[UnitCategory.Volume]: [Unit.Milliliter, Unit.Liter],
	[UnitCategory.Temperature]: [Unit.Celsius, Unit.Fahrenheit, Unit.Kelvin],
} as const satisfies Record<UnitCategory, Unit[]>;

export const symbolByUnit = {
	[Unit.Gram]: "g",
	[Unit.Kilogram]: "kg",
	[Unit.Ounce]: "oz",
	[Unit.Milliliter]: "mL",
	[Unit.Liter]: "L",
	[Unit.Celsius]: "°C",
	[Unit.Fahrenheit]: "°F",
	[Unit.Kelvin]: "°K",
} as const satisfies Record<Unit, string>;

export const unitSymbols = Object.values(symbolByUnit);
export type UnitSymbol = ValueOf<typeof symbolByUnit>;

export const aliasesByUnit = {
	[Unit.Gram]: ["gr"],
} as const satisfies Partial<Record<Unit, string[]>>;
