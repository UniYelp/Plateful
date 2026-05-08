import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { api } from "@backend/api";
import { append } from "&/aggregation";
import type { NavItem } from "@/components/layouts/Navbar";
import { seo } from "@/utils/seo";
import { useRecipeGenNotifications } from "&/recipes/hooks/useRecipeGenNotifications";

export const Route = createFileRoute("/(app)/(authed)/dashboard")({
	staticData: {
		navbar: {
			items: append<NavItem>([
				{
					label: "Dashboard",
					to: "/dashboard",
				},
				{
					label: "Ingredients",
					to: "/dashboard/ingredients",
				},
				{
					label: "Recipes",
					to: "/dashboard/recipes",
				},
			]),
		},
	},
	beforeLoad: async ({ context }) => {
		const household = await context.queryClient.ensureQueryData(
			convexQuery(api.households.currentUserHousehold),
		);

		const hasPreferences = await context.queryClient.ensureQueryData(
			convexQuery(api.userPreferences.exists, {}),
		);

		if (!hasPreferences) {
			throw redirect({ to: "/preferences" });
		}

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
	useRecipeGenNotifications();

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<Outlet />
		</div>
	);
}
