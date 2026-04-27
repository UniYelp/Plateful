import { useAuth } from "@clerk/clerk-react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import {
	MutationCache,
	notifyManager,
	QueryCache,
	QueryClient,
} from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { toast } from "sonner";

import { ErrorBoundary } from "&/errors/components/ErrorBoundary";
import { NotFound } from "&/errors/components/NotFound";
import type { StaticRouteData } from "&/router/types/static-data";
import { getRouteErrorHandler } from "&/router/utils/handle-route-error";
import { Devtools } from "@/components/layouts/Devtools";
import { ENV } from "@/configs/env.config";
import { routeTree } from "./routeTree.gen";

/**
 * TanstackQuery
 * - {@link https://tanstack.com/router/latest/docs/integrations/query}
 *
 * Convex
 * - {@link https://docs.convex.dev/client/tanstack/tanstack-query}
 * - {@link https://tanstack.com/router/v1/docs/framework/react/examples/start-convex-trellaux?path=examples%2Freact%2Fstart-convex-trellaux%2Fsrc%2Frouter.tsx}
 *
 * Clerk:
 * - {@link https://tanstack.com/router/v1/docs/framework/react/examples/start-clerk-basic?path=examples%2Freact%2Fstart-clerk-basic%2Fsrc%2Frouter.tsx}
 *
 * Auth
 * - {@link https://tanstack.com/router/v1/docs/framework/react/guide/authenticated-routes}
 */
export function getRouter() {
	if (typeof document !== "undefined") {
		notifyManager.setScheduler(window.requestAnimationFrame);
	}

	const convexClient = new ConvexReactClient(ENV.VITE_CONVEX_URL);

	/**
	 * {@link https://github.com/get-convex/convex-backend/tree/main/npm-packages/%40convex-dev/react-query}
	 */
	const convexQueryClient = new ConvexQueryClient(convexClient);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
		queryCache: new QueryCache({
			onError: getRouteErrorHandler(),
		}),
		mutationCache: new MutationCache({
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	});

	convexQueryClient.connect(queryClient);

	const router = createRouter({
		routeTree,
		context: {
			queryClient,
			// biome-ignore lint/style/noNonNullAssertion: This will be set after we wrap the app in an AuthProvider
			auth: undefined!,
		},
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultStructuralSharing: true,
		defaultPreloadStaleTime: 0,
		Wrap: ({ children }) => (
			<ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
				{children}
			</ConvexProviderWithClerk>
		),
		InnerWrap: ({ children }) => (
			<>
				{children}
				<Devtools />
			</>
		),
		defaultNotFoundComponent: NotFound,
		defaultErrorComponent: ErrorBoundary,
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

	interface StaticDataRouteOption extends StaticRouteData {}
}
