import type { AggregationOp } from "../types";

/**
 * @description Applies an aggregation operation to an accumulator.
 *
 * @note Mutates the accumulator.
 */
export const applyAggregationMutation = <T>(
	acc: T[],
	op: Readonly<AggregationOp<T>>,
): T[] => {
	switch (op.type) {
		case "append": {
			acc.push(...op.value);
			break;
		}
		case "prepend": {
			acc.unshift(...op.value);
			break;
		}
		case "replace": {
			acc.splice(0, acc.length, ...op.value);
			break;
		}
		case "remove": {
			const filtered = acc.filter((v) => !op.predicate(v));
			acc.splice(0, acc.length, ...filtered);
			break;
		}
		default: {
			const _exhaustive: never = op;
			console.warn("Unknown aggregation operation:", _exhaustive);
		}
	}

	return acc;
};

/**
 * @description Applies an aggregation operation to an accumulator and returns a new accumulator.
 */
export const applyAggregation = <T>(
	acc: readonly T[],
	op: Readonly<AggregationOp<T>>,
): T[] => applyAggregationMutation([...acc], op);
