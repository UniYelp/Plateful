import { useMatches } from "@tanstack/react-router";

export const useCurrentMatch = () => {
	const matches = useMatches();
	const match = matches.at(-1);
	return match;
};
