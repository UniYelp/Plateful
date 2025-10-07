import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CalendarDays, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { mockMealPlans, statusColors } from "@/pages/dashboard/meal-plan";

export const Route = createFileRoute("/(app)/dashboard/meal-plans/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <MealPlansPage />;
}

function MealPlansPage() {
	const [mealPlans] = useState(mockMealPlans);

	const formatDateRange = (startDate: string, endDate: string) => {
		const start = new Date(startDate).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
		const end = new Date(endDate).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
		return `${start} - ${end}`;
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="mb-2 font-bold text-3xl">Meal Plans</h1>
						<p className="text-muted-foreground">
							Plan your meals and stay organized
						</p>
					</div>
					<Button asChild>
						<Link to="/dashboard/meal-plans/create">
							<Plus className="mr-2 h-4 w-4" />
							Create Meal Plan
						</Link>
					</Button>
				</div>

				{/* Meal Plans Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{mealPlans.map((plan) => (
						<Card key={plan.id} className="transition-shadow hover:shadow-md">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="text-lg">{plan.title}</CardTitle>
										<CardDescription className="mt-1">
											{plan.description}
										</CardDescription>
									</div>
									<Badge
										className={
											statusColors[plan.status as keyof typeof statusColors]
										}
									>
										{plan.status}
									</Badge>
								</div>
							</CardHeader>

							<CardContent>
								<div className="space-y-4">
									{/* Date Range */}
									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<Calendar className="h-4 w-4" />
										{formatDateRange(plan.startDate, plan.endDate)}
									</div>

									{/* Stats */}
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="font-medium">{plan.totalRecipes}</p>
											<p className="text-muted-foreground">Total Meals</p>
										</div>
										<div>
											<p
												className={`font-medium ${plan.missingIngredients > 0 ? `text-destructive` : `text-green-600`}`}
											>
												{plan.missingIngredients}
											</p>
											<p className="text-muted-foreground">Missing Items</p>
										</div>
									</div>

									{/* Sample Meals Preview */}
									<div>
										<p className="mb-2 font-medium text-sm">This Week:</p>
										<div className="space-y-1">
											{plan.meals.slice(0, 3).map((meal, index) => (
												<div
													key={index}
													className="text-muted-foreground text-xs"
												>
													<span className="font-medium">{meal.day}:</span>{" "}
													{meal.dinner}
												</div>
											))}
											{plan.meals.length > 3 && (
												<div className="text-muted-foreground text-xs">
													+{plan.meals.length - 3} more days
												</div>
											)}
										</div>
									</div>

									{/* Actions */}
									<div className="flex gap-2 pt-2">
										<Button size="sm" className="flex-1" asChild>
											<Link to={`/dashboard/meal-plans/${plan.id}`}>
												<CalendarDays className="mr-1 h-3 w-3" />
												View Plan
											</Link>
										</Button>
										<Button variant="outline" size="sm">
											<Edit className="h-3 w-3" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="bg-transparent text-destructive hover:text-destructive"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{mealPlans.length === 0 && (
					<div className="py-12 text-center">
						<CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">No meal plans yet</h3>
						<p className="mb-4 text-muted-foreground">
							Start planning your meals to stay organized and save time
						</p>
						<Button asChild>
							<Link to="/dashboard/meal-plans/create">
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Meal Plan
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
