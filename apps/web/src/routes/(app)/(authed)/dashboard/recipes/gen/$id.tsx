import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { History } from "lucide-react";

import { api } from "@backend/api";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import { isGeneratingRecipe } from "&/recipes/utils/status";
import { generatingRecipeLoader } from "@/features/recipes/components/loaders/recipe-gen";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/recipes/gen/$id",
)({
	staticData: {
		links: [
			{
				to: "/dashboard/recipes/gen",
				label: "History",
				icon: <History className="mr-2 h-4 w-4" />,
			},
		],
	},
	loader: async ({ context, params }) => {
		const { household, queryClient } = context;
		const { id } = params;

		const gen = await queryClient.ensureQueryData(
			convexQuery(api.recipeGens.byIdAndHousehold, {
				genId: id,
				householdId: household._id,
			}),
		);

		return { household, genId: gen._id };
	},
	component: RouteComponent,
	pendingComponent: () => recipesLoader,
});

function RouteComponent() {
	return <RecipeGenerationPage />;
}

function RecipeGenerationPage() {
	const { household, genId } = Route.useLoaderData();

	const { data: recipeGen } = useSuspenseQuery(
		convexQuery(api.recipeGens.byIdAndHousehold, {
			genId,
			householdId: household._id,
		}),
	);

	if (isGeneratingRecipe(recipeGen)) return generatingRecipeLoader;

	return <Navigate to="/dashboard/recipes/gen" />;
}
