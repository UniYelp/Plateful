import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, Play, Plus, Search, Star, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui-0/badge";
import { Button } from "@/components/ui-0/button";
import { Card, CardContent } from "@/components/ui-0/card";
import { Input } from "@/components/ui-0/input";
import { difficultyColors, mockRecipes } from "@/pages/dashboard/recipes";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <RecipesPage />;
}

function RecipesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [recipes] = useState(mockRecipes);

	const filteredRecipes = recipes.filter((recipe) => {
		const matchesSearch =
			recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			recipe.tags.some((tag) =>
				tag.toLowerCase().includes(searchTerm.toLowerCase()),
			);

		const matchesFilter =
			selectedFilter === "all" ||
			(selectedFilter === "can-cook" && recipe.canCook) ||
			(selectedFilter === "cooked" && recipe.lastCooked) ||
			(selectedFilter === "new" && !recipe.lastCooked);

		return matchesSearch && matchesFilter;
	});

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="mb-2 font-bold text-3xl">Recipes</h1>
						<p className="text-muted-foreground">
							Discover and create delicious meals
						</p>
					</div>
					<Button asChild>
						<Link to="/dashboard/recipes/create">
							<Plus className="mr-2 h-4 w-4" />
							Create Recipe
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
								variant={
									selectedFilter === filter.value ? "default" : "outline"
								}
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
					{filteredRecipes.map((recipe) => (
						<Card
							key={recipe.id}
							className="overflow-hidden transition-shadow hover:shadow-md"
						>
							<div className="relative">
								<img
									src={recipe.image || "/placeholder.svg"}
									alt={recipe.title}
									className="h-48 w-full object-cover"
								/>
								<div className="absolute top-3 right-3">
									<Badge
										className={
											difficultyColors[
												recipe.difficulty as keyof typeof difficultyColors
											]
										}
									>
										{recipe.difficulty}
									</Badge>
								</div>
								{!recipe.canCook && (
									<div className="absolute top-3 left-3">
										<Badge
											variant="secondary"
											className="bg-amber-100 text-amber-800"
										>
											Missing Ingredients
										</Badge>
									</div>
								)}
							</div>

							<CardContent className="p-4">
								<div className="mb-2 flex items-start justify-between">
									<h3 className="font-semibold text-lg leading-tight">
										{recipe.title}
									</h3>
									<div className="flex items-center gap-1 text-muted-foreground text-sm">
										<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
										{recipe.rating}
									</div>
								</div>

								<p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
									{recipe.description}
								</p>

								<div className="mb-3 flex items-center gap-4 text-muted-foreground text-sm">
									<div className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										{recipe.cookTime}m
									</div>
									<div className="flex items-center gap-1">
										<Users className="h-3 w-3" />
										{recipe.servings}
									</div>
								</div>

								<div className="mb-4 flex flex-wrap gap-1">
									{recipe.tags.slice(0, 3).map((tag) => (
										<Badge key={tag} variant="outline" className="text-xs">
											{tag}
										</Badge>
									))}
								</div>

								{recipe.variants.length > 0 && (
									<div className="mb-3">
										<p className="mb-1 text-muted-foreground text-xs">
											Variants:
										</p>
										{recipe.variants.map((variant) => (
											<Badge
												key={variant.id}
												variant="secondary"
												className="mr-1 text-xs"
											>
												{variant.title}
											</Badge>
										))}
									</div>
								)}

								<div className="flex gap-2">
									<Button
										size="sm"
										className="flex-1"
										disabled={!recipe.canCook}
										asChild={recipe.canCook}
									>
										{recipe.canCook ? (
											<Link
												to="/dashboard/recipes/$id"
												params={{ id: recipe.id }}
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
											params={{ id: recipe.id }}
										>
											<BookOpen className="h-3 w-3" />
										</Link>
									</Button>
								</div>

								{recipe.lastCooked && (
									<p className="mt-2 text-muted-foreground text-xs">
										Last cooked:{" "}
										{new Date(recipe.lastCooked).toLocaleDateString()}
									</p>
								)}
							</CardContent>
						</Card>
					))}
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
							<Link to="/dashboard/recipes/create">
								<Plus className="mr-2 h-4 w-4" />
								Create Recipe
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
