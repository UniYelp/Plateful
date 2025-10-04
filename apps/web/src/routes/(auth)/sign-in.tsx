import { SignIn } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen min-w-screen items-center justify-center bg-background">
			<SignIn />
		</div>
	);
}
