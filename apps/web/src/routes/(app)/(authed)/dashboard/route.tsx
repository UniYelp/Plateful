import { createFileRoute, Outlet } from "@tanstack/react-router";

import { userCurrentHouseholdQuery } from "&/households/api";
import { getRouteErrorHandler } from "&/router/utils/handle-route-error";
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
			userCurrentHouseholdQuery,
		);

		return { household };
	},
	onError: getRouteErrorHandler(),
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
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<Outlet />
		</div>
	);
}
