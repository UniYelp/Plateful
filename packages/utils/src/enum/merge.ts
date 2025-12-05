import type { Prettify } from "@plateful/types";
import { Obj } from "../obj";

type MergeEnums<Enums extends Record<string, string>[]> =
	Enums extends readonly [
		infer First extends Record<string, string>,
		...infer Rest extends Record<string, string>[],
	]
		? Prettify<First & MergeEnums<Rest>>
		: unknown;

export const merge = <const Enums extends Record<string, string>[]>(
	...enums: Enums
): MergeEnums<Enums> => Obj.merge(...enums) as MergeEnums<Enums>;
