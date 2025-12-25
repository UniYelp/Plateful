import type { ValueOf } from "./value-of";

/**
 * @description unnest based on a union of values in a key
 */
export type UnNest<T, K extends keyof T> = ValueOf<{
	[U in K & PropertyKey]: ValueOf<{
		[V in T[U] as string]: Omit<T, U> & { [P in U]: V };
	}>;
}>;
