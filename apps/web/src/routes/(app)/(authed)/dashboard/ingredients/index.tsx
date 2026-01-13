import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Eye, Package, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

import { getExpiryDetailsFromExpiryDates } from "@plateful/ingredients";
import { api } from "@backend/api";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import {
	categories,
	colorByExpiryStatus,
	ingredientImgByCategory,
} from "&/ingredients/constants";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ingredientSymbolToDisplay } from "@/features/ingredients/utils/ingredient-symbol-to-display";

export const Route = createFileRoute("/(app)/(authed)/dashboard/ingredients/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <IngredientsPage />;
}

function IngredientsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const household = useCurrentHousehold();

	const ingredients = useQuery(
		api.ingredients.byHousehold,
		household ? { householdId: household._id } : "skip",
	);
	const deleteIngredient = useMutation(api.ingredients.deleteIngredient);

	const filteredIngredients = ingredients?.filter((ingredient) => {
		const matchesSearch =
			ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || ingredient.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	if (!household) return "Loading...";

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="mb-2 font-bold text-3xl">Ingredients</h1>
						<p className="text-muted-foreground">
							Manage your kitchen inventory
						</p>
					</div>
					<Button asChild>
						<Link to="/dashboard/ingredients/add">
							<Plus className="mr-2 h-4 w-4" />
							Add Ingredient
						</Link>
					</Button>
				</div>

				{/* Search and Filter */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row">
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
						<Input
							placeholder="Search ingredients..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
					<div className="flex gap-2 overflow-x-auto">
						{categories.map((category) => (
							<Button
								key={category}
								variant={selectedCategory === category ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedCategory(category)}
								className="whitespace-nowrap"
							>
								{category.charAt(0).toUpperCase() + category.slice(1)}
							</Button>
						))}
					</div>
				</div>

				{/* Ingredients Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredIngredients?.map((ingredient) => {
						const expirations = ingredient.quantities.flatMap(
							(q) => q.expiresAt ?? [],
						);

						const expiryStatusDetails =
							getExpiryDetailsFromExpiryDates(expirations);

						return (
							<Card
								key={ingredient._id}
								className="transition-shadow hover:shadow-md"
							>
								<CardContent className="p-4">
									<div className="mb-3 flex items-start gap-3">
										<img
											src={
												ingredientImgByCategory[
													ingredient.category as keyof typeof ingredientImgByCategory
												]
											}
											alt={ingredient.name}
											className="h-16 w-16 rounded-lg bg-muted object-cover"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between">
												<h3 className="truncate font-semibold">
													{ingredient.name}
												</h3>
												{expiryStatusDetails && (
													<Badge
														variant={
															colorByExpiryStatus[expiryStatusDetails.status]
														}
														className="text-nowrap text-xs"
													>
														{expiryStatusDetails.text}
													</Badge>
												)}
											</div>
											<p className="truncate text-muted-foreground text-sm">
												{ingredient.description}
											</p>
											<p className="mt-1 font-medium text-sm">
												{/* TODO: do sum instead */}
												{ingredient.quantities[0].amount}{" "}
												{ingredientSymbolToDisplay(
													ingredient.quantities[0].unit,
												)}
											</p>
										</div>
									</div>


									<div className="mt-4 flex gap-2">
										<Button
											asChild
											variant="outline"
											size="sm"
											className="flex-1 bg-transparent"
										>
											<Link
												to="/dashboard/ingredients/$id"
												params={{ id: ingredient._id }}
											>
												<Eye className="mr-1 h-3 w-3" />
												View
											</Link>
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													className="bg-transparent text-destructive hover:text-destructive"
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Are you absolutely sure?
													</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be undone. You won't be able to
														restore the ingredient data after deletion.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															deleteIngredient({
																ingredientId: ingredient._id,
																householdId: household?._id,
															})
														}
													>
														Continue
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{!filteredIngredients ||
					(filteredIngredients.length === 0 && (
						<div className="py-12 text-center">
							<Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">
								No ingredients found
							</h3>
							<p className="mb-4 text-muted-foreground">
								{searchTerm || selectedCategory !== "all"
									? "Try adjusting your search or filter"
									: "Start by adding your first ingredient"}
							</p>
							<Button asChild>
								<Link to="/dashboard/ingredients/add">
									<Plus className="mr-2 h-4 w-4" />
									Add Ingredient
								</Link>
							</Button>
						</div>
					))}
			</div>
		</div>
	);
}
