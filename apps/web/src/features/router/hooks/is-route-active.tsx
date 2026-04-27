import { type LinkProps, useMatchRoute } from "@tanstack/react-router";

export const useIsRouteActive = (link: LinkProps) => {
	const matchRoute = useMatchRoute();
	const params = matchRoute(link);
	const isActive = !!params;
	return isActive;
};
