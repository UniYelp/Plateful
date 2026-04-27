export type AggregationOp<T> =
	| { type: "append"; value: T[] }
	| { type: "prepend"; value: T[] }
	| { type: "replace"; value: T[] }
	| { type: "remove"; predicate: (item: T) => boolean };
