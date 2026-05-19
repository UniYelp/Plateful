import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";

import { HouseholdLoading } from "&/households/components/loaders/HouseholdLoader";

export const Route = createFileRoute("/(app)/(authed)")({
	beforeLoad: async ({ context }) => {
		const { auth } = context;

		if (auth.isLoaded || auth.isSignedIn) return;

		await auth.getToken();
	},
	component: AuthGuard,
	pendingComponent: HouseholdLoading,
});

function AuthGuard() {
	return (
		<>
			<Authenticated>
				<Outlet />
			</Authenticated>
			<Unauthenticated>
				<Navigate to="/sign-in" />
			</Unauthenticated>
		</>
	);
}
