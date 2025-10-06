import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/utils/seo";

export const Route = createFileRoute("/(app)/(authed)/a")({
	head: () => ({
		meta: [
			...seo({
				title: "Plateful | a",
			}),
		],
	}),
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
