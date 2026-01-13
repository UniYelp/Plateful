import {
	createFileRoute,
	notFound,
	Outlet,
	redirect,
} from "@tanstack/react-router";

import { isConvexError, isCustomConvexError } from "@backend/errors";
import { userCurrentHouseholdQuery } from "&/households/api";
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
	beforeLoad: async ({ context }) => {
		const household = await context.queryClient.ensureQueryData(
			userCurrentHouseholdQuery,
		);

		return { household };
	},
	onError: (err: unknown) => {
		if (isConvexError(err)) {
			if (isCustomConvexError(err)) {
				switch (err.data.at(0)) {
					case "Forbidden":
					case "Not_Found": {
						throw notFound();
					}
					case "Unauthorized": {
						throw redirect({
							to: "/sign-in",
							search: {
								redirect: Route.path,
							},
						});
					}
				}
			}
		}
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
	return <Outlet />;
}
