import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { generatingRecipeLoader } from "@/features/recipes/components/loaders";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/recipes/gen/$id",
)({
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

	const isGenerating =
		recipeGen.state.status === "pending" ||
		recipeGen.state.status === "generating";

	if (!isGenerating) return generatingRecipeLoader;

    // TODO: 
	return (
		<div>
			Status: {recipeGen.state.status} |{" "}
			{recipeGen.state.status === "failed" && recipeGen.state.reason}
		</div>
	);
}
