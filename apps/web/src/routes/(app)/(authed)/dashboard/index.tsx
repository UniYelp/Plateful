import { useUser } from "@clerk/clerk-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AlertTriangle, BookOpen, Package, Plus, Sparkles } from "lucide-react";

import { getExpiryDetailsFromExpiryDates } from "@plateful/ingredients";
import { api } from "@backend/api";
import { getRouteErrorHandler } from "&/router/utils/handle-route-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(app)/(authed)/dashboard/")({
	loader: async ({ context }) => {
		const { household } = context;
		return { household };
	},
	onError: getRouteErrorHandler(),
	component: RouteComponent,
});

function RouteComponent() {
	return <DashboardPage />;
}

// TODO: skeletons

function DashboardPage() {
	const { household } = Route.useLoaderData();

	const { user, isLoaded } = useUser();

	const ingredientsCount = useQuery(api.ingredients.ingredientsCount, {
		householdId: household._id,
	});

	const recipesCount = useQuery(api.recipes.countByHousehold, {
		householdId: household._id,
	});

	const expiringSoonIngredients = useQuery(
		api.ingredients.expiringSoonIngredients,
		{ householdId: household._id },
	);

	// const latestGenerations = useQuery(
	// 	api.recipeGens.
	// )

	if (!isLoaded || !user) {
		return <div>Loading...</div>;
	}

	return (
		<>
			{/* Welcome Section */}
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-3xl">
					Welcome back, {user.firstName || "Chef"}!
				</h1>
				<p className="text-muted-foreground">
					Here's what's happening in your kitchen today.
				</p>
			</div>

			{/* Stats Cards */}
			<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Package className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-bold text-2xl">
									{ingredientsCount || "..."}
								</p>
								<p className="text-muted-foreground text-sm">Ingredients</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<BookOpen className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-bold text-2xl">{recipesCount || "..."}</p>
								<p className="text-muted-foreground text-sm">Recipes</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-destructive/50">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
								<AlertTriangle className="h-5 w-5 text-destructive" />
							</div>
							<div>
								<p className="font-bold text-2xl text-destructive">
									{expiringSoonIngredients?.length}
								</p>
								<p className="text-muted-foreground text-sm">Expiring Soon</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				{/* Quick Actions */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
							<CardDescription>Get started with common tasks</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 sm:grid-cols-2">
								<Button
									className="h-auto flex-col gap-2 bg-transparent p-4"
									variant="outline"
									asChild
								>
									<Link to="/dashboard/ingredients/add">
										<Plus className="h-6 w-6" />
										<span>Add Ingredient</span>
									</Link>
								</Button>

								<Button
									className="h-auto flex-col gap-2 bg-transparent p-4"
									variant="outline"
									asChild
								>
									<Link to="/dashboard/recipes/gen/new">
										<Sparkles className="h-6 w-6" />
										<span>Generate Recipe</span>
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
					{/* Recipe Generations */}
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Recipe Generations</CardTitle>
							<CardDescription>
								Your recent AI-generated recipes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
									<div className="h-12 w-12 overflow-hidden rounded-lg bg-primary/10">
										<img
											src="/creamy-basil-chicken-pasta.jpg"
											alt=""
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="flex-1">
										<p className="font-medium text-sm">Creamy Chicken Pasta</p>
										<p className="text-muted-foreground text-xs">
											Generated 2 days ago
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
									<div className="h-12 w-12 overflow-hidden rounded-lg bg-primary/10">
										<img
											src="/mediterranean-chicken-bowl.jpg"
											alt=""
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="flex-1">
										<p className="font-medium text-sm">Mediterranean Bowl</p>
										<p className="text-muted-foreground text-xs">
											Generated 3 days ago
										</p>
									</div>
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="mt-4 w-full bg-transparent"
								asChild
							>
								<Link to="/dashboard/recipes/gen">View All Generations</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
				<div>
					{/* Expiring Items Alert */}
					<Card className="border-destructive/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-destructive">
								<AlertTriangle className="h-5 w-5" />
								Expiring Soon
							</CardTitle>
							<CardDescription>Items that need your attention</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{expiringSoonIngredients?.map(({ name, quantities }) => {
									const expirations = quantities.flatMap(
										(q) => q.expiresAt ?? [],
									);

									const statusDetails =
										getExpiryDetailsFromExpiryDates(expirations);

									if (!statusDetails) return null;

									return (
										<div
											key={`expiring-ingredient-${name}`}
											className="flex items-center justify-between text-sm"
										>
											<span>{name}</span>
											<Badge variant="destructive" className="text-xs">
												{statusDetails.text}
											</Badge>
										</div>
									);
								})}
							</div>

							<Button
								variant="outline"
								size="sm"
								className="mt-4 w-full bg-transparent"
								asChild
							>
								<Link to="/dashboard/ingredients">View All</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
