import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { api } from "@backend/api";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import { RecipeGenState } from "&/recipes/components/RecipeGenState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/gen/")({
	loader: async ({ context }) => {
		const { household, queryClient } = context;

		queryClient.ensureQueryData(
			convexQuery(api.recipeGens.byHousehold, {
				householdId: household._id,
			}),
		);

		return { household };
	},
	component: RouteComponent,
	pendingComponent: () => recipesLoader,
});

function RouteComponent() {
	return <RecipeGenerationsPage />;
}

function RecipeGenerationsPage() {
	const { household } = Route.useLoaderData();

	const { data: recipeGens } = useSuspenseQuery(
		convexQuery(api.recipeGens.byHousehold, {
			householdId: household._id,
		}),
	);

	// TODO: add a no-gens view

	return (
		<>
			<div className="mb-8 flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/dashboard/recipes">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Link>
				</Button>
				<div>
					<h1 className="font-bold text-3xl">Recipe Generation History</h1>
					<p className="text-muted-foreground">
						View your latest recipe generations' results
					</p>
				</div>
			</div>

			<div className="space-y-4">
				{recipeGens.map((item) => (
					<RecipeGenState key={item._id} gen={item} />
				))}
			</div>
		</>
	);
}
