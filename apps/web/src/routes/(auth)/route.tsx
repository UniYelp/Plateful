import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";

export const Route = createFileRoute("/(auth)")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Unauthenticated>
				<Outlet />
			</Unauthenticated>
			<Authenticated>
				<Navigate to="/dashboard" />
			</Authenticated>
		</>
	);
}
