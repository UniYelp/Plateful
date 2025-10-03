import { useUser } from "@clerk/clerk-react";
import {
	type TanStackDevtoolsReactPlugin,
	TanstackDevtools,
} from "@tanstack/react-devtools";
import { FormDevtoolsPlugin } from "@tanstack/react-form-devtools";
import type { QueryClient } from "@tanstack/react-query";

import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: Root,
});

function Root() {
	const posthog = usePostHog();
	const { user } = useUser();

	useEffect(() => {
		if (user && posthog) {
			posthog.identify(user.id, {
				email: user?.primaryEmailAddress?.emailAddress,
			});
		}
	}, [posthog, user]);

	return (
		<>
			<Outlet />
			<TanstackDevtools
				config={{
					position: "bottom-left",
					hideUntilHover: true,
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
					{
						name: "TanStack Query",
						render: <ReactQueryDevtoolsPanel />,
					},
					FormDevtoolsPlugin() as TanStackDevtoolsReactPlugin,
				]}
			/>
		</>
	);
}
