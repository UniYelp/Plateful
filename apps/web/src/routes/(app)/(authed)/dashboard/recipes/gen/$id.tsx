import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { History } from "lucide-react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { RecipeGenState } from "&/recipes/components/RecipeGenState";
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
	component: RouteComponent,
});

function RouteComponent() {
	return <RecipeGenerationPage />;
}

function RecipeGenerationPage() {
	const { id } = Route.useParams();
	const genId = id as Id<"recipeGens">;

	const household = useCurrentHousehold();

	const recipeGen = useQuery(
		api.recipeGens.byIdAndHousehold,
		household ? { genId, householdId: household._id } : "skip",
	);

	if (!recipeGen) {
		return "Loading...";
	}

	if (isGeneratingRecipe(recipeGen)) return generatingRecipeLoader;

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<RecipeGenState gen={recipeGen} />
		</div>
	);
}
