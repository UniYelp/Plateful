import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, History, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

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

	const generationsStats = useQuery(api.recipeGens.stats, {
		householdId: household._id,
	});

	const isQuotaReached =
		generationsStats &&
		generationsStats.today.total >= generationsStats.today.max;

	const retryGen = useMutation(api.recipeGens.retry);

	const handleRetry = async () => {
		await retryGen({ genId: recipeGen._id, householdId: household._id });
	};

	if (recipeGen.state.status === "failed") {
		return (
			<div className="flex min-h-full items-center justify-center overflow-hidden bg-background">
				<div className="pointer-events-none fixed inset-0">
					<div
						className="absolute inset-0 transition-opacity duration-1000"
						style={{
							background: `radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--destructive)) / 0.05, transparent)`,
						}}
					/>
				</div>

				<div className="relative z-10 mx-auto w-full max-w-lg px-6 pt-50">
					<div className="flex flex-col items-center">
						<div className="relative mb-10">
							<div
								className="-m-6 absolute inset-0 rounded-full border-2 border-destructive/20 border-dashed"
							/>
							<div className="-m-3 absolute inset-0 rounded-full bg-destructive/10" />

							<div
								className="relative flex h-24 w-24 items-center justify-center"
							>
								<AlertCircle className="h-12 w-12 text-destructive-foreground" />
							</div>
						</div>

						<div className="mb-10 space-y-2 text-center">
							<h2 className="animate-fade-in-up font-bold text-2xl text-foreground">
								Recipe Generation Failed
							</h2>
							<p className="mx-auto max-w-xs animate-fade-in-up-delayed-both text-muted-foreground text-sm">
								{recipeGen.state.reason ||
									"Something went wrong while creating your recipe. Please try again."}
							</p>
						</div>

						<div className="animate-fade-in-up-delayed-both" style={{ animationDelay: "0.4s" }}>
							<Button onClick={handleRetry} size="lg" className="gap-2" disabled={isQuotaReached}>
								<RotateCcw className="h-4 w-4" />
								Retry Generation
							</Button>
							{isQuotaReached && (
								<p className="mt-2 text-destructive text-sm font-medium">Quota Reached</p>
							)}
						</div>
					</div>
				</div>
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
