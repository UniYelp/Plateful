import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/(app)/(authed)")({
	component: AuthGuard,
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
