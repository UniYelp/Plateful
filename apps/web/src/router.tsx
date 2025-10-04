import { createRouter, type LinkComponentProps } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Devtools } from "@/components/layouts/DevTools";
import { queryClient } from "@/configs/query.config";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultStructuralSharing: true,
		defaultPreloadStaleTime: 0,
		InnerWrap: ({ children }) => (
			<>
				{children}
				<Devtools />
			</>
		),
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}

	interface StaticDataRouteOption {
		links?: (LinkComponentProps & {
			label: string;
		})[];
		loader?: React.ReactElement;
	}
}
