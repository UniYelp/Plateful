import { useUser } from "@clerk/clerk-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	AlertTriangle,
	BookOpen,
	Calendar,
	ChefHat,
	Clock,
	Package,
	Plus,
	ShoppingCart,
} from "lucide-react";

import { getExpiryStatusDetailsFromExpiryDate } from "@plateful/ingredients";
import { api } from "@backend/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ManageHousehold } from "@/components/users/ManageHousehold";
import { useCurrentHousehold } from "@/features/households/hooks/useCurrentHouseholds";
import {
	mockRecentActivity,
	mockStats,
} from "@/pages/dashboard/dashboard-page";

export const Route = createFileRoute("/(app)/(authed)/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <DashboardPage />;
}

function DashboardPage() {
	const { user, isLoaded } = useUser();

	const household = useCurrentHousehold();

	const ingredientsCount = useQuery(
		api.ingredients.ingredientsCount,
		household ? { householdId: household._id } : "skip",
	);

	const expiringSoonIngredients = useQuery(
		api.ingredients.expiringSoonIngredients,
		household ? { householdId: household._id } : "skip",
	);

	if (!isLoaded || !user) {
		return <div>Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
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
									<p className="font-bold text-2xl">{ingredientsCount}</p>
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
									<p className="font-bold text-2xl">{mockStats.recipes}</p>
									<p className="text-muted-foreground text-sm">Recipes</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Calendar className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="font-bold text-2xl">{mockStats.mealPlans}</p>
									<p className="text-muted-foreground text-sm">Meal Plans</p>
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
										<Link to="/dashboard/recipes/create">
											<ChefHat className="h-6 w-6" />
											<span>Create Recipe</span>
										</Link>
									</Button>

									<Button
										className="h-auto flex-col gap-2 bg-transparent p-4"
										variant="outline"
										asChild
									>
										<Link to="/dashboard/meal-plans/create">
											<Calendar className="h-6 w-6" />
											<span>Plan Meals</span>
										</Link>
									</Button>

									<Button
										className="h-auto flex-col gap-2 bg-transparent p-4"
										variant="outline"
										asChild
									>
										<Link to="/dashboard/shopping-list">
											<ShoppingCart className="h-6 w-6" />
											<span>Shopping List</span>
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card className="mt-6">
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>
									Your latest cooking activities
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{mockRecentActivity.map((activity) => (
										<div
											key={activity.id}
											className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
										>
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
												{/* TODO: Add to mock data */}
												{activity.type === "recipe" && (
													<ChefHat className="h-4 w-4 text-primary" />
												)}
												{activity.type === "ingredient" && (
													<Package className="h-4 w-4 text-primary" />
												)}
												{activity.type === "meal-plan" && (
													<Calendar className="h-4 w-4 text-primary" />
												)}
											</div>
											<div className="flex-1">
												<p className="font-medium">{activity.title}</p>
												<p className="flex items-center gap-1 text-muted-foreground text-sm">
													<Clock className="h-3 w-3" />
													{activity.time}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
					<div>
						{household && <ManageHousehold household={household} />}

						{/* Expiring Items Alert */}
						<Card className="mt-6 border-destructive/50">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-destructive">
									<AlertTriangle className="h-5 w-5" />
									Expiring Soon
								</CardTitle>
								<CardDescription>
									Items that need your attention
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{expiringSoonIngredients?.map(({ name, quantities }) => {
										const expirations = quantities.flatMap(
											(q) => q.expiresAt ?? [],
										);
										const soonestExpiry = Math.min(...expirations);
										const statusDetails =
											getExpiryStatusDetailsFromExpiryDate(soonestExpiry);

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
			</div>
		</div>
	);
}
