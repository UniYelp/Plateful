import type { Prettify } from "@plateful/types";

type Entry = readonly [PropertyKey, any];

export type EntriesToObject<Entries extends readonly Entry[]> =
	Entries extends readonly [
		infer First extends Entry,
		...infer Rest extends Entry[],
	]
		? Prettify<
				{
					[K in First[0]]: First[1];
				} & EntriesToObject<Rest>
			>
		: unknown;

export const fromEntries = <const Entries extends Entry[]>(
	entries: Entries,
): EntriesToObject<Entries> =>
	Object.fromEntries(entries) as EntriesToObject<Entries>;
