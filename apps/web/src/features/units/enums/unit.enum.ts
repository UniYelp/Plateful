import type { ValueOf } from "@plateful/types";

export const Unit = {
	Gram: "Gram",
	Kilogram: "Kilogram",
	Ounce: "Ounce",
	Milliliter: "Milliliter",
	Liter: "Liter",
	Celsius: "Celsius",
	Fahrenheit: "Fahrenheit",
	Kelvin: "Kelvin",
} as const;

export type Unit = ValueOf<typeof Unit>;
