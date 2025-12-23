import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import {
	MutationCache,
	notifyManager,
	QueryClient,
} from "@tanstack/react-query";
import { createRouter, type LinkComponentProps } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { toast } from "sonner";

import { Devtools } from "@/components/layouts/Devtools";
import { ENV } from "@/configs/env.config";
import { NotFound } from "./components/layouts/NotFound";
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
 */
export function getRouter() {
	if (typeof document !== "undefined") {
		notifyManager.setScheduler(window.requestAnimationFrame);
	}

	const convexClient = new ConvexReactClient(ENV.VITE_CONVEX_URL);

	/**
	 * TODO: fix
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
		mutationCache: new MutationCache({
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	});

	convexQueryClient.connect(queryClient);

	const router = createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultStructuralSharing: true,
		defaultPreloadStaleTime: 0,
		Wrap: ({ children }) => (
			<>
				<ClerkProvider
					publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}
					signInFallbackRedirectUrl="/dashboard"
					signInUrl="/dashboard"
					signUpFallbackRedirectUrl="/dashboard"
					signUpUrl="/dashboard"
				>
					<ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
						{children}
					</ConvexProviderWithClerk>
				</ClerkProvider>
			</>
		),
		InnerWrap: ({ children }) => (
			<>
				{children}
				<Devtools />
			</>
		),
		defaultNotFoundComponent: NotFound,
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
		// backLink: //TODO: add backLink logic
        // TODO: add links merging logic
		links?: (LinkComponentProps & {
			icon?: React.JSX.Element;
			label: string;
		})[];
		loader?: React.ReactElement;
	}
}
