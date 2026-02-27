import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { History } from "lucide-react";

import { api } from "@backend/api";
import { RecipeGenStatus } from "&/recipes/components/loaders/recipe-gen-status";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import {
	isCompletedRecipeGen,
	isGeneratingRecipe,
} from "&/recipes/utils/status";

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

	if (recipeGen.state.status === "failed") {
		return (
			<div className="flex min-h-100 flex-col items-center justify-center">
				<History className="h-16 w-16 text-destructive" />
				<h3 className="mt-6 mb-2 font-bold text-2xl text-destructive">
					Recipe Generation Failed
				</h3>
				<p className="text-muted-foreground">
					{recipeGen.state.reason || "Something went wrong while creating your recipe. Please try again."}
				</p>
			</div>
		);
	}

	if (isGeneratingRecipe(recipeGen))
		return <RecipeGenStatus currentStep={recipeGen.state.status} />;

	if (isCompletedRecipeGen(recipeGen)) {
		const {
			state: { recipeId },
		} = recipeGen;

		return <Navigate to="/dashboard/recipes/$id" params={{ id: recipeId }} />;
	}

	return <Navigate to="/dashboard/recipes/gen" />;
}
