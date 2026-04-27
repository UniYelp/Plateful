import { useMatches } from "@tanstack/react-router";
import { useMemo } from "react";

import type { Match } from "../types/match";

export const useNearestMatch = <T>(
	select: (data: Match["staticData"]) => T | undefined,
): T | undefined => {
	const matches = useMatches();

	return useMemo(() => {
		for (const match of matches.toReversed()) {
			const data = select(match.staticData);
			if (data !== undefined) return data;
		}

		return undefined;
	}, [matches, select]);
};
