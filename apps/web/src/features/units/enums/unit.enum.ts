import type { ValueOf } from "@plateful/types";

export const Unit = {
	// #region Mass
	Gram: "Gram",
	Kilogram: "Kilogram",
	Ounce: "Ounce",
	Pound: "Pound",
	// #endregion
	// #region Volume
	Milliliter: "Milliliter",
	Liter: "Liter",
	Teaspoon: "Teaspoon",
	Dessertspoon: "Dessertspoon",
	Tablespoon: "Tablespoon",
	Cup: "Cup",
	// FluidOunce: "FluidOunce",
	// #endregion
	// #region Temperature
	Celsius: "Celsius",
	Fahrenheit: "Fahrenheit",
	Kelvin: "Kelvin",
	// #endregion
} as const;

export type Unit = ValueOf<typeof Unit>;
