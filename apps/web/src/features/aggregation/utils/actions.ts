import type { OneOrMany } from "@plateful/types";
import { toArray } from "@plateful/utils";
import type { AggregationOp } from "../types/aggregation-op";

export const append = <T>(value: OneOrMany<T>): AggregationOp<T> => ({
	type: "append",
	value: toArray(value),
});

export const prepend = <T>(value: OneOrMany<T>): AggregationOp<T> => ({
	type: "prepend",
	value: toArray(value),
});

export const replace = <T>(value: OneOrMany<T>): AggregationOp<T> => ({
	type: "replace",
	value: toArray(value),
});

export const remove = <T>(predicate: (v: Readonly<T>) => boolean): AggregationOp<T> => ({
	type: "remove",
	predicate,
});
