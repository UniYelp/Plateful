import { useMatches } from "@tanstack/react-router";
import { useMemo } from "react";

export const useCurrentMatch = () => {
	const matches = useMatches();
	const match = useMemo(() => matches.at(-1), [matches]);
	return match;
};
