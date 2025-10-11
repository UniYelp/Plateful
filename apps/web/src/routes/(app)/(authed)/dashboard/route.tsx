import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/(authed)/dashboard")({
	component: RouteComponent,
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
});

function RouteComponent() {
	return <Outlet />;
}
