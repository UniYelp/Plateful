import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { api } from "@backend/api";
import { seo } from "@/utils/seo";

export const Route = createFileRoute("/(app)/(authed)/dashboard")({
	staticData: {
		links: [
			{
				label: "Ingredients",
				to: "/dashboard/ingredients",
			},
			{
				label: "Recipes",
				to: "/dashboard/recipes",
			},
		],
	},
	beforeLoad: async ({ context }) => {
		const household = await context.queryClient.ensureQueryData(
			convexQuery(api.households.currentUserHousehold),
		);

		return { household };
	},
	head: () => ({
		meta: [
			...seo({
				title: "dashboard",
			}),
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<Outlet />
		</div>
	);
}
