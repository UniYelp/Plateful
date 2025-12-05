import type { Prettify } from "@plateful/types";
import { fromEntries } from "../obj";
import { entries } from "./entries";

type Merge<Enums extends object[]> = Enums extends readonly [
	infer First extends object,
	...infer Rest extends object[],
]
	? Prettify<First & Merge<Rest>>
	: unknown;

export const merge = <const Objects extends object[]>(
	...objects: Objects
): Merge<Objects> =>
	fromEntries(objects.flatMap((e) => entries(e))) as Merge<Objects>;
