import type { OneOrMany } from "@plateful/types";

/**
 * @description A utility function that converts a value or an array of values to an array of values.
 *
 * @template T The type of the value.
 * @param value The value to convert.
 * @returns An array of values.
 *
 * @note The types don't work properly with const arrays
 */
export const toArray = <T>(value: OneOrMany<T>): T[] =>
	Array.isArray(value) ? value : [value];
