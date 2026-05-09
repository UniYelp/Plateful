import { type LinkProps, useMatchRoute } from "@tanstack/react-router";

export const useIsRouteActive = (link: LinkProps) => {
	const matchRoute = useMatchRoute();
	return !!matchRoute(link);
};
