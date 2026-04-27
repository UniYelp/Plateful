import { useMatches } from "@tanstack/react-router";
import { useMemo } from "react";

import {
	type Aggregation,
	applyAggregationMutation,
} from "@/features/aggregation";
import type { Match } from "../types/match";

export const useAggregatedMatch = <T>(
	select: (data: Match["staticData"]) => Aggregation<T> | undefined,
): T[] => {
	const matches = useMatches();

	return useMemo(() => {
		const acc: T[] = [];

		for (const match of matches) {
			const result = select(match.staticData);
			if (!result) continue;

			const ops = Array.isArray(result) ? result : [result];

			for (const op of ops) {
				applyAggregationMutation(acc, op);
			}
		}

		return acc;
	}, [matches, select]);
};
