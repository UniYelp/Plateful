import { useUser } from "@clerk/clerk-react";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
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
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</>
	);
}
