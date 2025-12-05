import type { UnknownArray } from "@plateful/types";

export const concat = <
	const Arr1 extends UnknownArray,
	const Arr2 extends UnknownArray,
>(
	arr1: Arr1,
	arr2: Arr2,
) => arr1.concat(arr2) as [...Arr1, ...Arr2];
