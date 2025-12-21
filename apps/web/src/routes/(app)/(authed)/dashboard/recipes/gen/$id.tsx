import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";

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

	return (
		<div>
			Status: {recipeGen.state.status} |{" "}
			{recipeGen.state.status === "failed" && recipeGen.state.reason}
		</div>
	);
}
