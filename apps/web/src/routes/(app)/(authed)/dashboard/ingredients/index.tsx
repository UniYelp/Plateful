import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Eye, Package, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { getExpiryDetailsFromExpiryDates } from "@plateful/ingredients";
import { api } from "@backend/api";
import { ingredientLoader } from "&/ingredients/component/loaders/ingredient";
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
	validateSearch: z.object({
		expiringOnly: z.boolean().optional().default(false),
	}),
	loader: async ({ context }) => {
		const { household, queryClient } = context;

		const ingredients = await queryClient.ensureQueryData(
			convexQuery(api.ingredients.byHousehold, {
				householdId: household._id,
			}),
		);

		return { household, ingredients };
	},
	component: RouteComponent,
	pendingComponent: () => ingredientLoader,
});

function RouteComponent() {
	return <IngredientsPage />;
}

function IngredientsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const { household } = Route.useLoaderData();

	const { expiringOnly } = Route.useSearch();

	const { data: ingredients } = useSuspenseQuery(
		convexQuery(api.ingredients.byHousehold, {
			householdId: household._id,
		}),
	);

	const deleteIngredient = useMutation(api.ingredients.deleteIngredient);

	const filteredIngredientsByCategory = ingredients
		?.filter((ingredient) => {
			const matchesSearch =
				ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || ingredient.category === selectedCategory;

			if (!matchesSearch || !matchesCategory) return false;

			if (expiringOnly) {
				const expirations = ingredient.quantities.flatMap(
					(q) => q.expiresAt ?? [],
				);
				const expiryStatusDetails = getExpiryDetailsFromExpiryDates(expirations);
				
				if (!expiryStatusDetails) return false;
				if (
					expiryStatusDetails.status !== "expired" &&
					expiryStatusDetails.status !== "expiring" &&
					expiryStatusDetails.status !== "warning"
				) {
					return false;
				}
			}

			return true;
		})
		.toSorted((a, b) => {
			if (!expiringOnly) return 0;

			const expirationsA = a.quantities.flatMap((q) => q.expiresAt ?? []);
			const expirationsB = b.quantities.flatMap((q) => q.expiresAt ?? []);

			const minExpiryA = expirationsA.length ? Math.min(...expirationsA) : Infinity;
			const minExpiryB = expirationsB.length ? Math.min(...expirationsB) : Infinity;

			return minExpiryA - minExpiryB;
		});

	return (
		<>
			{/* Page Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="mb-2 font-bold text-3xl">Ingredients</h1>
					<p className="text-muted-foreground">Manage your kitchen inventory</p>
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
					<Button
						variant={expiringOnly ? "destructive" : "outline"}
						size="sm"
						className="whitespace-nowrap"
					>
						<Link to="/dashboard/ingredients" search={(prev) => ({ ...prev, expiringOnly: !prev.expiringOnly })}>
							Expiring Soon
						</Link>
					</Button>
					<div className="mx-2 w-px bg-border" />
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
				{filteredIngredientsByCategory?.map((ingredient) => {
					const expirations = ingredient.quantities.flatMap(
						(q) => q.expiresAt ?? [],
					);

					const expiryStatusDetails =
						getExpiryDetailsFromExpiryDates(expirations);

					return (
						<Card
							key={ingredient._id}
							className="py-6 transition-shadow hover:shadow-md"
						>
							<CardContent className="px-4">
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
											{ingredientSymbolToDisplay(ingredient.quantities[0].unit)}
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

			{!filteredIngredientsByCategory ||
				(filteredIngredientsByCategory.length === 0 && (
					<div className="py-12 text-center">
						<Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">No ingredients found</h3>
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
		</>
	);
}
