import type { UnknownArray } from "@plateful/types";

export const flatten = <const Args extends UnknownArray[]>(
	...args: Args
): Args[number][number][] => args.flat();
