import { type AnyRouteMatch, useMatches } from "@tanstack/react-router";

export const useFirstRouteMatch = (
	filter: (match: AnyRouteMatch) => boolean,
	{ reversed = true }: { reversed?: boolean } = {},
) => {
	const matches = useMatches();
	const match = (reversed ? matches.findLast : matches.find)(filter);
	return match;
};
