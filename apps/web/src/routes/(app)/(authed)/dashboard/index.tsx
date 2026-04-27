import { useUser } from "@clerk/clerk-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AlertTriangle, BookOpen, Package, Plus, Sparkles } from "lucide-react";

import { getExpiryDetailsFromExpiryDates } from "@plateful/ingredients";
import { api } from "@backend/api";
import { HouseholdLoading } from "&/households/components/loaders/HouseholdLoader";
import { RecipeGenState } from "&/recipes/components/RecipeGenState";
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
	pendingComponent: HouseholdLoading,
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

	const latestGenerations = useQuery(api.recipeGens.byHousehold, {
		householdId: household._id,
	});

	const generationsStats = useQuery(api.recipeGens.stats, {
		householdId: household._id,
	});

	if (!isLoaded || !user) {
		return <div>Loading...</div>;
	}

	const isQuotaReached =
		generationsStats &&
		generationsStats.today.total >= generationsStats.today.max;

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
			<div className="mb-8 grid grid-cols-3 gap-4 md:grid-cols-3">
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
									className="group relative h-auto flex-col gap-2 bg-transparent p-4"
									variant="outline"
									asChild
									disabled={isQuotaReached}
								>
									<Link
										to="/dashboard/recipes/gen/new"
										disabled={isQuotaReached}
										aria-disabled={isQuotaReached}
										className={
											isQuotaReached
												? "pointer-events-none text-neutral-400"
												: ""
										}
										onClick={(e) => {
											if (isQuotaReached) {
												e.preventDefault();
											}
										}}
									>
										<Sparkles className="h-6 w-6" />
										<span>Generate Recipe</span>
										{isQuotaReached && (
											<span className="-top-3 absolute right-[-10px] rounded-full bg-destructive px-2 py-0.5 text-[10px] text-destructive-foreground">
												Quota Reached
											</span>
										)}
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
								{latestGenerations?.map((gen) => (
									<RecipeGenState key={gen._id} gen={gen} title={gen.title} />
								))}
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
								<Link
									to="/dashboard/ingredients"
									search={{ expiringOnly: true }}
								>
									View All
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
