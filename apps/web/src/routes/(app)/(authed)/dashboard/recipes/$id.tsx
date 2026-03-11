import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Play, Utensils } from "lucide-react";
import { ViewTransition } from "react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { getTotalAmount } from "&/ingredients/utils/total-amount";
import { CookNowDialog } from "&/recipes/components/CookNowDialog";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import { isIngredientSufficient } from "&/recipes/utils/availableIngredients";
import { formatDuration } from "&/recipes/utils/format-duration";
import { formatStep } from "&/recipes/utils/format-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const { household, queryClient } = context;
		const { id } = params;

		const fullRecipe = await queryClient.ensureQueryData(
			convexQuery(api.recipes.fullById, {
				householdId: household._id,
				recipeId: id as Id<"recipes">,
			}),
		);

		const { recipe } = fullRecipe;

		return { household, recipeId: recipe._id };
	},
	pendingComponent: () => recipesLoader,
});

function RouteComponent() {
	return <RecipeDetailPage />;
}

function RecipeDetailPage() {
	const { household, recipeId } = Route.useLoaderData();

	const { data: fullRecipe } = useSuspenseQuery(
		convexQuery(api.recipes.fullById, {
			recipeId,
			householdId: household._id,
		}),
	);

	const { recipe, ingredients, imgGen, steps } = fullRecipe;

	const ingredientNameById = Object.fromEntries(
		ingredients.map(({ ingredient: { name, _id } }) => [_id, name] as const),
	);

	const ingredientsByIsAvailable = Object.groupBy(ingredients, (ingredient) => {
		const isAvailable = isIngredientSufficient({
			ingredientQuantities: ingredient.ingredient.quantities,
			neededQuantities: ingredient.quantities,
		});

		return `${isAvailable}`;
	});

	const availableIngredients = ingredientsByIsAvailable.true ?? [];
	const missingIngredients = ingredientsByIsAvailable.false ?? [];

	const canCook = missingIngredients.length === 0;

	return (
		<>
			{/* Back Button */}
			<Button variant="ghost" size="sm" className="mb-6" asChild>
				<Link to="/dashboard/recipes">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Recipes
				</Link>
			</Button>

			{/* Recipe Header */}
			<div className="mb-8 grid gap-8 lg:grid-cols-2">
				<div>
					<div className="mb-4 flex items-start justify-between">
						<div>
							<ViewTransition name={`recipe-title-${recipe._id}`}>
								<h1 className="mb-2 font-bold text-3xl">{recipe.title}</h1>
							</ViewTransition>
						</div>
					</div>

					<p className="mb-6 text-muted-foreground">{recipe.description}</p>

					<div className="mb-6 flex gap-5">
						{recipe.cookTime && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">
									Cook: {formatDuration(recipe.cookTime)}
								</span>
							</div>
						)}
						{recipe.prepTime && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">
									Prep: {formatDuration(recipe.prepTime)}
								</span>
							</div>
						)}
					</div>

					<div className="mb-6 flex flex-wrap gap-2">
						{recipe.tags.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>

					<div className="flex gap-4">
						<CookNowDialog
							householdId={household._id}
							ingredients={ingredients}
						>
							<Button size="lg" className="flex-1" disabled={!canCook}>
								<Play className="mr-2 h-4 w-4" />
								Start Cooking
							</Button>
						</CookNowDialog>
					</div>

					{!canCook && (
						<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
							<p className="text-amber-800 text-sm">
								<strong>Missing ingredients:</strong>{" "}
								{missingIngredients
									.map((ing) => ing.ingredient.name)
									.join(", ")}
							</p>
						</div>
					)}
				</div>
				{imgGen?.imageUrl ? (
					<ViewTransition name={`recipe-img-${recipe._id}`}>
						<img
							src={imgGen.imageUrl}
							alt={recipe.title}
							className="h-68 w-full rounded-lg object-cover"
						/>
					</ViewTransition>
				) : imgGen?.status === "generating" ? (
					<Skeleton className="h-68 w-full rounded-xl" />
				) : (
					<div className="flex h-68 w-full items-center justify-center bg-muted">
						<Utensils className="h-12 w-12 text-muted-foreground" />
					</div>
				)}
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				{/* Ingredients */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Ingredients</CardTitle>
							<CardDescription>
								{availableIngredients.length} of {ingredients.length} available
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{ingredients.map((ingredient) => {
									const isAvailable = isIngredientSufficient({
										ingredientQuantities: ingredient.ingredient.quantities,
										neededQuantities: ingredient.quantities,
									});

									return (
										<div
											key={ingredient.ingredient._id}
											className="flex items-center justify-between"
										>
											<div
												className={`flex-1 ${!isAvailable ? "text-muted-foreground line-through" : ""}`}
											>
												<span className="font-medium">
													{ingredient?.ingredient.name}
												</span>
												<p className="text-muted-foreground text-sm">
													{getTotalAmount(ingredient?.quantities)}
												</p>
											</div>
											<div
												className={`h-3 w-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
											/>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Instructions */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Instructions</CardTitle>
							<CardDescription>
								Follow these steps to create your dish
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{steps.map((step) => (
									<div key={step._id} className="flex items-center gap-4">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
											{step.index + 1}
										</div>
										<p className="text-sm leading-relaxed">
											{formatStep(step, ingredientNameById)}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
