import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

import { api } from "@backend/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { categories } from "@/pages/dashboard/ingredients";

export const Route = createFileRoute("/(app)/(authed)/dashboard/ingredients/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <IngredientsPage />;
}

// TODO: refactor

function IngredientsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const households = useQuery(api.households.getUserHouseholds);
	const household = households?.[0];

	const ingredients = useQuery(
		api.ingredients.householdIngredients,
		household ? { householdId: household._id } : "skip",
	);

	const filteredIngredients = ingredients?.filter((ingredient) => {
		const matchesSearch =
			ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || ingredient.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	type ExpiryStatus = {
		status: "expired" | "expiring" | "warning" | "good";
		color: "default" | "destructive" | "secondary" | "outline" | null | undefined;
		text: string;
	}

	const getExpiryStatus : (expiryDate: string | number) => ExpiryStatus = (expiryDate) => {
		const second = 1000;
		const minute = second * 60;
		const hour = minute * 60;
		const day = hour * 24;
		const daysInWeek = 7;

		const today = new Date();
		const expiry = new Date(expiryDate);
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (day));

		if (diffDays < 0)
			return { status: "expired", color: "destructive", text: "Expired" };
		if (diffDays <= 3)
			return {
				status: "expiring",
				color: "destructive",
				text: `${diffDays} days`,
			};
		if (diffDays <= daysInWeek)
			return {
				status: "warning",
				color: "secondary",
				text: `${diffDays} days`,
			};
		return { status: "good", color: "outline", text: `${diffDays} days` };
	};

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
						const expiryStatus = getExpiryStatus(ingredient.quantities[0].expiresAt || 0); // TODO: fix
						return (
							<Card
								key={ingredient._id}
								className="transition-shadow hover:shadow-md"
							>
								<CardContent className="p-4">
									<div className="mb-3 flex items-start gap-3">
										<img
											src={ingredient.images || "/placeholder.svg"} // TODO: fix
											alt={ingredient.name}
											className="h-16 w-16 rounded-lg bg-muted object-cover"
										/>
										<div className="min-w-0 flex-1">
											<h3 className="truncate font-semibold">
												{ingredient.name}
											</h3>
											<p className="truncate text-muted-foreground text-sm">
												{ingredient.description}
											</p>
											<p className="mt-1 font-medium text-sm">
												{/* TODO: do sum instead */}
												{ingredient.quantities[0].amount} {ingredient.quantities[0].unit}
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Added:</span>
											<span>
												{new Date(ingredient._creationTime).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Expires:</span>
											<Badge
												variant={expiryStatus.color}
												className="text-xs"
											>
												{expiryStatus.status === "expired"
													? "Expired"
													: expiryStatus.text}
											</Badge>
										</div>
									</div>

									<div className="mt-4 flex gap-2">
										<Button
											variant="outline"
											size="sm"
											className="flex-1 bg-transparent"
										>
											<Edit className="mr-1 h-3 w-3" />
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="bg-transparent text-destructive hover:text-destructive"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{!filteredIngredients || filteredIngredients.length === 0 && (
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
				)}
			</div>
		</div>
	);
}
