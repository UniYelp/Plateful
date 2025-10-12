import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	Clock,
	Edit,
	Play,
	ShoppingCart,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fullMealTypes, mockMealPlan } from "@/pages/dashboard/meal-plan";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/meal-plans/$id",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <MealPlanDetailPage />;
}

function MealPlanDetailPage() {
	// const { id } = useParams();
	const [mealPlan] = useState(mockMealPlan);

	const formatDateRange = (startDate: string, endDate: string) => {
		const start = new Date(startDate).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
		});
		const end = new Date(endDate).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
		return `${start} - ${end}`;
	};

	const getTotalCookTime = () => {
		let total = 0;
		mealPlan.meals.forEach((day) => {
			if (day.breakfast) total += day.breakfast.cookTime;
			if (day.lunch) total += day.lunch.cookTime;
			if (day.dinner) total += day.dinner.cookTime;
		});
		return total;
	};

	const getCanCookCount = () => {
		let canCook = 0;
		let total = 0;
		mealPlan.meals.forEach((day) => {
			if (day.breakfast) {
				total++;
				if (day.breakfast.canCook) canCook++;
			}
			if (day.lunch) {
				total++;
				if (day.lunch.canCook) canCook++;
			}
			if (day.dinner) {
				total++;
				if (day.dinner.canCook) canCook++;
			}
		});
		return { canCook, total };
	};

	const cookStats = getCanCookCount();

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-6xl px-4 py-8">
				{/* Back Button */}
				<Button variant="ghost" size="sm" className="mb-6" asChild>
					<Link to="/dashboard/meal-plans">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Meal Plans
					</Link>
				</Button>

				{/* Plan Header */}
				<div className="mb-8">
					<div className="mb-4 flex items-start justify-between">
						<div>
							<h1 className="mb-2 font-bold text-3xl">{mealPlan.title}</h1>
							<p className="mb-2 text-muted-foreground">
								{mealPlan.description}
							</p>
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<Calendar className="h-4 w-4" />
								{formatDateRange(mealPlan.startDate, mealPlan.endDate)}
							</div>
						</div>
						<div className="flex gap-2">
							<Button variant="outline">
								<Edit className="mr-2 h-4 w-4" />
								Edit Plan
							</Button>
							<Button asChild>
								<Link to="/dashboard/shopping-list">
									<ShoppingCart className="mr-2 h-4 w-4" />
									Shopping List
								</Link>
							</Button>
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<Card>
							<CardContent className="p-4">
								<div className="font-bold text-2xl">
									{mealPlan.totalRecipes}
								</div>
								<p className="text-muted-foreground text-sm">Total Meals</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="font-bold text-2xl text-green-600">
									{cookStats.canCook}/{cookStats.total}
								</div>
								<p className="text-muted-foreground text-sm">Ready to Cook</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="font-bold text-2xl">
									{Math.round(getTotalCookTime() / 60)}h
								</div>
								<p className="text-muted-foreground text-sm">Total Cook Time</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div
									className={`font-bold text-2xl ${mealPlan.missingIngredients > 0 ? "text-destructive" : "text-green-600"}`}
								>
									{mealPlan.missingIngredients}
								</div>
								<p className="text-muted-foreground text-sm">Missing Items</p>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Meal Schedule */}
				<div className="space-y-6">
					{mealPlan.meals.map((day) => (
						<Card key={day.day}>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>
										{day.day} - {day.date}
									</span>
									<Badge variant="outline" className="text-xs">
										{
											[day.breakfast, day.lunch, day.dinner].filter(Boolean)
												.length
										}{" "}
										meals
									</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									{fullMealTypes.map((mealType) => {
										const meal = day[mealType.key as keyof typeof day] as any;
										return (
											<div key={mealType.key} className="space-y-2">
												<div className="flex items-center gap-2">
													<Badge className={mealType.color}>
														{mealType.label}
													</Badge>
												</div>
												{meal ? (
													<Card className="border-2">
														<CardContent className="p-4">
															<h4 className="mb-2 font-medium">{meal.title}</h4>
															<div className="mb-3 flex items-center justify-between text-muted-foreground text-sm">
																<div className="flex items-center gap-1">
																	<Clock className="h-3 w-3" />
																	{meal.cookTime}m
																</div>
																<div
																	className={`h-2 w-2 rounded-full ${meal.canCook ? "bg-green-500" : "bg-red-500"}`}
																/>
															</div>
															<div className="flex gap-2">
																<Button
																	size="sm"
																	className="flex-1"
																	disabled={!meal.canCook}
																	asChild={meal.canCook}
																>
																	{meal.canCook ? (
																		<Link
																			to="/dashboard/recipes/$id"
																			params={{ id: meal.id }}
																		>
																			<Play className="mr-1 h-3 w-3" />
																			Cook
																		</Link>
																	) : (
																		<>
																			<Play className="mr-1 h-3 w-3" />
																			Cook
																		</>
																	)}
																</Button>
																<Button variant="outline" size="sm" asChild>
																	<Link
																		to="/dashboard/recipes/$id"
																		params={{ id: meal.id }}
																	>
																		View
																	</Link>
																</Button>
															</div>
														</CardContent>
													</Card>
												) : (
													<Card className="border-2 border-dashed">
														<CardContent className="p-4 text-center">
															<p className="mb-2 text-muted-foreground text-sm">
																No meal planned
															</p>
															<Button variant="outline" size="sm">
																Add Meal
															</Button>
														</CardContent>
													</Card>
												)}
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
