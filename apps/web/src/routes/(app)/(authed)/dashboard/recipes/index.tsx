import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { parse } from "iso8601-duration";
import { BookOpen, Clock, Play, Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { api } from "@backend/api";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import { isIngredientSufficient } from "&/recipes/utils/availableIngredients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { household, queryClient } = context;

		await queryClient.ensureQueryData(
			convexQuery(api.recipes.byHousehold, {
				householdId: household._id,
			}),
		);

		return { household };
	},
	pendingComponent: () => recipesLoader,
});

function RouteComponent() {
	return <RecipesPage />;
}

function RecipesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");

	const { household } = Route.useLoaderData();

	const { data: fullRecipes } = useSuspenseQuery(
		convexQuery(api.recipes.byHousehold, {
			householdId: household._id,
		}),
	);

	const filteredRecipes = fullRecipes.filter(({ recipe }) => {
		const matchesSearch =
			recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			recipe.tags.some((tag) =>
				tag.toLowerCase().includes(searchTerm.toLowerCase()),
			);

		// TODO: add canCook functionality, as well as other filters
		const matchesFilter = selectedFilter === "all"; // ||
		// (selectedFilter === "can-cook" && recipe.canCook) ||
		// (selectedFilter === "cooked" && recipe.lastCooked) ||
		// (selectedFilter === "new" && !recipe.lastCooked);

		return matchesSearch && matchesFilter;
	});

	return (
		<>
			{/* Page Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="mb-2 font-bold text-3xl">Recipes</h1>
					<p className="text-muted-foreground">
						Discover and create delicious meals
					</p>
				</div>
				<Button asChild>
					<Link to="/dashboard/recipes/gen/new">
						<Sparkles className="mr-2 h-4 w-4" />
						Generate Recipe
					</Link>
				</Button>
			</div>

			{/* Search and Filter */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
					<Input
						placeholder="Search recipes..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2 overflow-x-auto">
					{[
						{ value: "all", label: "All" },
						{ value: "can-cook", label: "Can Cook" },
						{ value: "cooked", label: "Previously Cooked" },
						{ value: "new", label: "New" },
					].map((filter) => (
						<Button
							key={filter.value}
							variant={selectedFilter === filter.value ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedFilter(filter.value)}
							className="whitespace-nowrap"
						>
							{filter.label}
						</Button>
					))}
				</div>
			</div>

			{/* Recipes Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filteredRecipes.map((fullRecipe) => {
					const { imgGen, recipe, ingredients } = fullRecipe;

					const ingredientsByIsAvailable = Object.groupBy(
						ingredients,
						(ingredient) => {
							const isAvailable = isIngredientSufficient({
								ingredientQuantities: ingredient.ingredient.quantities,
								neededQuantities: ingredient.quantities,
							});

							return `${isAvailable}`;
						},
					);

					const missingIngredients = ingredientsByIsAvailable.false ?? [];
					const canCook = missingIngredients.length === 0;

					return (
						<Card
							key={recipe._id}
							className="overflow-hidden transition-shadow hover:shadow-md"
						>
							{imgGen?.imageUrl && (
								<div className="relative">
									<img
										src={imgGen.imageUrl}
										alt={recipe.title}
										className="h-48 w-full object-cover"
									/>
								</div>
							)}

							<CardContent className="flex h-full flex-col justify-between p-4">
								<div>
									<div className="mb-2 flex items-start justify-between">
										<h3 className="font-semibold text-lg leading-tight">
											{recipe.title}
										</h3>
									</div>

									<p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
										{recipe.description}
									</p>

									<div className="mb-4 flex flex-wrap gap-1">
										{recipe.tags.slice(0, 3).map((tag) => (
											<Badge key={tag} variant="outline" className="text-xs">
												{tag}
											</Badge>
										))}
										<div className="absolute top-3 right-3">
											{/* <Badge
											className={
												difficultyColors[
													recipe.difficulty as keyof typeof difficultyColors
												]
												}
											>
												{recipe.difficulty}
											</Badge> */}
										</div>
										{!canCook && (
											<Badge
												variant="secondary"
												className="bg-amber-100 text-amber-800"
											>
												Missing Ingredients
											</Badge>
										)}
									</div>

									<div className="mb-3 flex items-center gap-4 text-muted-foreground text-sm">
										{recipe.cookTime && (
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{
													// TODO: fix error
													// @ts-expect-error: unrecognized available API
													new Intl.DurationFormat("en", {
														style: "short",
													}).format(parse(recipe.cookTime))
												}
											</div>
										)}

										{/* <div className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									{recipe.servings}
								</div> */}
									</div>
									{/* {recipe.lastCooked && (
								<p className="mt-2 text-muted-foreground text-xs">
									Last cooked:{" "}
									{new Date(recipe.lastCooked).toLocaleDateString()}
								</p>
							)} */}
								</div>

								<div className="flex gap-2">
									<Button
										size="sm"
										className="flex-1"
										disabled={!canCook}
										asChild={canCook}
									>
										{canCook ? (
											<Link
												to="/dashboard/recipes/$id"
												params={{ id: recipe._id }}
											>
												<Play className="mr-1 h-3 w-3" />
												Cook Now
											</Link>
										) : (
											<>
												<Play className="mr-1 h-3 w-3" />
												Cook Now
											</>
										)}
									</Button>
									<Button variant="outline" size="sm" asChild>
										<Link
											to="/dashboard/recipes/$id"
											params={{ id: recipe._id }}
										>
											<BookOpen className="h-3 w-3" />
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{filteredRecipes.length === 0 && (
				<div className="py-12 text-center">
					<BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No recipes found</h3>
					<p className="mb-4 text-muted-foreground">
						{searchTerm || selectedFilter !== "all"
							? "Try adjusting your search or filter"
							: "Start by creating your first recipe"}
					</p>
					<Button asChild>
						<Link to="/dashboard/recipes/gen/new">
							<Sparkles className="mr-2 h-4 w-4" />
							Generate Recipe
						</Link>
					</Button>
				</div>
			)}
		</>
	);
}
