import { createFileRoute, Outlet } from "@tanstack/react-router";

import { seo } from "@/utils/seo";

export const Route = createFileRoute("/(app)/(authed)/dashboard")({
	head: () => ({
		meta: [
			...seo({
				title: "dashboard",
			}),
		],
	}),
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
			{
				label: "Meal Plan",
				to: "/dashboard/meal-plans",
			},
			{
				label: "Shopping List",
				to: "/dashboard/shopping-list",
			},
		],
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
