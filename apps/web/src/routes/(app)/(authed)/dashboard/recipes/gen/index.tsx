import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";

import { api } from "@backend/api";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import { RecipeGenState } from "&/recipes/components/RecipeGenState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/gen/")({
	loader: ({ context }) => {
		const { household } = context;
		return { household };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <RecipeGenerationsPage />;
}

function RecipeGenerationsPage() {
	const { household } = Route.useLoaderData();

	const recipeGens = useQuery(api.recipeGens.byHousehold, {
		householdId: household._id,
	});

	if (!recipeGens) return recipesLoader;

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
