import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { parse } from "iso8601-duration";
import { ArrowLeft, Clock, Heart, Play } from "lucide-react";
import { useState } from "react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { getTotalAmount } from "&/ingredients/utils/total-amount";
import { isIngredientSufficient } from "&/recipes/utils/availableIngredients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { mockRecipe } from "@/pages/dashboard/recipes";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const { household, queryClient } = context;
		const { id } = params;
		const fullRecipe = await queryClient.ensureQueryData(
			convexQuery(api.recipeIngredients.fullByRecipe, {
				householdId: household._id,
				recipeId: id as Id<"recipes">,
			}),
		);

		return { household, fullRecipe };
	},
});

function RouteComponent() {
	return <RecipeDetailPage />;
}

function RecipeDetailPage() {
	const { household } = Route.useLoaderData();
	const { id } = Route.useParams();
	const [_recipe] = useState(mockRecipe);

	const { data: fullRecipe } = useSuspenseQuery(
		convexQuery(api.recipeIngredients.fullByRecipe, {
			recipeId: id as Id<"recipes">,
			householdId: household._id,
		}),
	);

	const ingredientsByIsAvailable = Object.groupBy(
		fullRecipe.ingredients,
		(ingredient) => {
			const isAvailable = isIngredientSufficient({
				ingredientQuantities: ingredient.ingredient.quantities,
				neededQuantities: ingredient.quantities,
			});

			return `${isAvailable}`;
		},
	);

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
				{/* <div>
					<img
						src={recipe.image || "/placeholder.svg"}
						alt={recipe.title}
						className="h-64 w-full rounded-lg object-cover lg:h-80"
					/>
				</div> */}

				<div>
					<div className="mb-4 flex items-start justify-between">
						<div>
							<h1 className="mb-2 font-bold text-3xl">
								{fullRecipe.recipe.title}
							</h1>
						</div>
					</div>

					<p className="mb-6 text-muted-foreground">
						{fullRecipe.recipe.description}
					</p>

					<div className="mb-6 grid grid-cols-2 gap-4">
						{fullRecipe.recipe.cookTime && (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">
									{
										// TODO: fix error
										// @ts-expect-error: unrecognized available API
										new Intl.DurationFormat("en", {
											style: "short",
										}).format(parse(fullRecipe.recipe.cookTime))
									}{" "}
								</span>
							</div>
						)}

						{/* <div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">{recipe.servings} servings</span>
						</div> */}
					</div>

					<div className="mb-6 flex flex-wrap gap-2">
						{fullRecipe.recipe.tags.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>

					<div className="flex gap-3">
						<Button
							size="lg"
							className="flex-1"
							disabled={!canCook}
							asChild={canCook}
						>
							{canCook ? (
								<Link
									to="/dashboard/recipes/$id"
									params={{ id: fullRecipe.recipe._id }}
								>
									<Play className="mr-2 h-4 w-4" />
									Start Cooking
								</Link>
							) : (
								<>
									<Play className="mr-2 h-4 w-4" />
									Start Cooking
								</>
							)}
						</Button>
						{/* <Button variant="outline" size="lg">
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</Button> */}
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
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				{/* Ingredients */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Ingredients</CardTitle>
							<CardDescription>
								{availableIngredients.length} of {fullRecipe.ingredients.length}{" "}
								available
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{fullRecipe.ingredients.map((ingredient) => {
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
								{fullRecipe.steps.map((step) => (
									<div key={step._id} className="flex gap-4">
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
											{step.index + 1}
										</div>
										<p className="pt-1 text-sm leading-relaxed">step.blocks</p>
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
