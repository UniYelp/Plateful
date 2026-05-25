import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, Play, Utensils, X } from "lucide-react";
import { useMemo } from "react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { getTotalAmount } from "&/ingredients/utils/total-amount";
import { CookNowDialog } from "&/recipes/components/CookNowDialog";
import { Feedback } from "&/recipes/components/Feedback";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import { RecipeStepContent } from "&/recipes/components/RecipeStepContent";
import {
	calculateRecipeMaxPortions,
	isIngredientSufficient,
} from "&/recipes/utils/available-ingredients";
import { ensureV1RecipeStep } from "&/recipes/utils/convert-recipe";
import { formatDuration } from "&/recipes/utils/format-duration";
import { formatQuantity } from "&/recipes/utils/format-quantity";
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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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

		return { householdId: household._id, recipeId: recipe._id };
	},
	pendingComponent: () => recipesLoader,
});

function RouteComponent() {
	return <RecipeDetailPage />;
}

function RecipeDetailPage() {
	const { householdId, recipeId } = Route.useLoaderData();

	const { data: fullRecipe } = useSuspenseQuery(
		convexQuery(api.recipes.fullById, {
			recipeId,
			householdId,
		}),
	);

	const { recipe, ingredients, imgGen, steps } = fullRecipe;

	const convertedSteps = useMemo(() => steps.map(ensureV1RecipeStep), [steps]);

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

	const maxPortions = calculateRecipeMaxPortions(ingredients);
	const canCook = missingIngredients.length === 0 && maxPortions > 0;

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
							<h1 className="mb-2 font-bold text-3xl">{recipe.title}</h1>
						</div>
					</div>

					<p className="mb-6 text-muted-foreground">{recipe.description}</p>

					<div className="mb-6 flex flex-wrap gap-5">
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
						<div className="flex items-center gap-2">
							<Utensils className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">
								Portions possible:{" "}
								<span className="font-semibold text-primary">
									{maxPortions === Number.POSITIVE_INFINITY
										? "Unlimited"
										: maxPortions}
								</span>
							</span>
						</div>
					</div>

					<div className="mb-6 flex flex-wrap gap-2">
						{recipe.tags.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>

					<div className="flex gap-4">
						<CookNowDialog householdId={householdId} ingredients={ingredients}>
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
					<img
						src={imgGen.imageUrl}
						alt={recipe.title}
						className="h-68 w-full rounded-lg object-cover"
					/>
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
											className="flex items-start justify-between gap-3"
										>
											<div className="flex flex-1 items-start gap-2">
												{!isAvailable ? (
													<X
														className="mt-1 h-4 w-4 shrink-0 text-destructive"
														aria-hidden="true"
													/>
												) : (
													<Check
														className="mt-1 h-4 w-4 shrink-0 text-green-500"
														aria-hidden="true"
													/>
												)}
												<span className="sr-only">
													{isAvailable ? "Available" : "Missing"}
												</span>
												<div
													className={`flex-1 ${!isAvailable ? "text-muted-foreground" : ""}`}
												>
													<span className="font-medium">
														{ingredient?.ingredient.name}
													</span>
													<p className="text-muted-foreground text-sm">
														{getTotalAmount(ingredient?.quantities)}
													</p>
												</div>
											</div>
											<div
												className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
												aria-hidden="true"
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
								{convertedSteps.map((step, index) => {
									const hasWaste =
										step.metadata?.waste && step.metadata.waste.length > 0;

									const hasDerivedOutput =
										step.metadata?.derivedOutputs &&
										step.metadata.derivedOutputs.length > 0;

									const bulletElement = (
										<div className="relative">
											<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
												{index + 1}
											</div>
											{step.metadata?.priority === "health" && (
												<span className="-top-1 -right-1 absolute flex h-4 w-4 animate-pulse items-center justify-center rounded-full border border-background bg-emerald-500 font-black text-[10px] text-white shadow-[0_0_8px_rgba(16,185,129,0.7)]">
													H
												</span>
											)}
										</div>
									);

									const tooltipContent =
										hasWaste || hasDerivedOutput ? (
											<TooltipContent side="right" className="max-w-[280px]">
												<div className="space-y-2.5 p-0.5 text-xs">
													{hasWaste && (
														<div>
															<p className="mb-1 flex items-center gap-1.5 font-semibold text-[11px] text-rose-500 uppercase tracking-wider">
																<span>Waste produced</span>
															</p>
															<ul className="list-inside list-disc space-y-1 text-muted-foreground">
																{step.metadata?.waste?.map((w, idx) => {
																	const name =
																		"name" in w.of
																			? w.of.name
																			: ingredientNameById[w.of.id] ||
																				"Unknown Ingredient";
																	const qtyStr =
																		typeof w.quantity === "string"
																			? w.quantity
																			: formatQuantity(w.quantity);
																	return (
																		<li key={idx}>
																			<span className="font-medium text-foreground">
																				{name}
																			</span>
																			: {qtyStr}
																		</li>
																	);
																})}
															</ul>
														</div>
													)}
													{hasDerivedOutput && (
														<div>
															<p className="mb-1 flex items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-wider">
																<span>Yields</span>
															</p>
															<ul className="list-inside list-disc space-y-1 text-muted-foreground">
																{step.metadata?.derivedOutputs?.map(
																	(o, idx) => {
																		const name =
																			"name" in o.of
																				? o.of.name
																				: ingredientNameById[o.of.id] ||
																					"Unknown Ingredient";
																		const qtyStr =
																			typeof o.quantity === "string"
																				? o.quantity
																				: formatQuantity(o.quantity);
																		return (
																			<li key={idx}>
																				<span className="font-medium text-foreground">
																					{name}
																				</span>
																				: {qtyStr}
																			</li>
																		);
																	},
																)}
															</ul>
														</div>
													)}
												</div>
											</TooltipContent>
										) : null;

									return (
										<div key={step.index} className="flex items-start gap-4">
											{tooltipContent ? (
												<Tooltip>
													<TooltipTrigger asChild>
														<button
															type="button"
															className="text-left focus:outline-none"
														>
															{bulletElement}
														</button>
													</TooltipTrigger>
													{tooltipContent}
												</Tooltip>
											) : (
												bulletElement
											)}
											<div className="flex-1 text-sm leading-relaxed">
												<RecipeStepContent
													step={step}
													ingredientNameById={ingredientNameById}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>

					<Feedback householdId={householdId} recipeId={recipeId} />
				</div>
			</div>
		</>
	);
}
