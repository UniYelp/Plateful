import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/a")({
	component: RouteComponent,
	staticData: {
		links: [
			{
				label: "Home",
				to: "/",
			},
		],
	},
});

function RouteComponent() {
	return <div>Hello "/(app)/temp"!</div>;
}
