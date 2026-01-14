import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Edit, Heart, Play, Star, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { mockRecipe } from "@/pages/dashboard/recipes";

export const Route = createFileRoute("/(app)/(authed)/dashboard/recipes/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <RecipeDetailPage />;
}

function RecipeDetailPage() {
	// const { id } = Route.useParams();
	const [recipe] = useState(mockRecipe);
	const [isFavorited, setIsFavorited] = useState(false);

	const availableIngredients = recipe.ingredients.filter(
		(ing) => ing.available,
	);
	const missingIngredients = recipe.ingredients.filter((ing) => !ing.available);

	return (
		<>
			{/* Back Button */}
			<Button variant="ghost" size="sm" className="mb-6" asChild>
				<Link to="/dashboard/recipes">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Recipes
				</Link>
			</Button>

			{/* Recipe Header */}
			<div className="mb-8 grid gap-8 lg:grid-cols-2">
				<div>
					<img
						src={recipe.image || "/placeholder.svg"}
						alt={recipe.title}
						className="h-64 w-full rounded-lg object-cover lg:h-80"
					/>
				</div>

				<div>
					<div className="mb-4 flex items-start justify-between">
						<div>
							<h1 className="mb-2 font-bold text-3xl">{recipe.title}</h1>
							<div className="mb-3 flex items-center gap-2">
								<div className="flex items-center gap-1">
									<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
									<span className="font-medium">{recipe.rating}</span>
								</div>
								<Badge
									className={
										recipe.difficulty === "Easy"
											? "bg-green-100 text-green-800"
											: recipe.difficulty === "Medium"
												? "bg-yellow-100 text-yellow-800"
												: "bg-red-100 text-red-800"
									}
								>
									{recipe.difficulty}
								</Badge>
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsFavorited(!isFavorited)}
						>
							<Heart
								className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
							/>
						</Button>
					</div>

					<p className="mb-6 text-muted-foreground">{recipe.description}</p>

					<div className="mb-6 grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">{recipe.cookTime} minutes</span>
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">{recipe.servings} servings</span>
						</div>
					</div>

					<div className="mb-6 flex flex-wrap gap-2">
						{recipe.tags.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>

					<div className="flex gap-3">
						<Button
							size="lg"
							className="flex-1"
							disabled={!recipe.canCook}
							asChild={recipe.canCook}
						>
							{recipe.canCook ? (
								<Link to="/dashboard/recipes/$id" params={{ id: recipe.id }}>
									<Play className="mr-2 h-4 w-4" />
									Start Cooking
								</Link>
							) : (
								<>
									<Play className="mr-2 h-4 w-4" />
									Start Cooking
								</>
							)}
						</Button>
						<Button variant="outline" size="lg">
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</Button>
					</div>

					{!recipe.canCook && (
						<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
							<p className="text-amber-800 text-sm">
								<strong>Missing ingredients:</strong>{" "}
								{missingIngredients.map((ing) => ing.name).join(", ")}
							</p>
						</div>
					)}
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				{/* Ingredients */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Ingredients</CardTitle>
							<CardDescription>
								{availableIngredients.length} of {recipe.ingredients.length}{" "}
								available
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{recipe.ingredients.map((ingredient, index) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										key={index}
										className="flex items-center justify-between"
									>
										<div
											className={`flex-1 ${!ingredient.available ? "text-muted-foreground line-through" : ""}`}
										>
											<span className="font-medium">{ingredient.name}</span>
											<p className="text-muted-foreground text-sm">
												{ingredient.amount}
											</p>
										</div>
										<div
											className={`h-3 w-3 rounded-full ${ingredient.available ? "bg-green-500" : "bg-red-500"}`}
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Nutrition Info */}
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Nutrition (per serving)</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="font-medium">Calories</p>
									<p className="text-muted-foreground">
										{recipe.nutritionInfo.calories}
									</p>
								</div>
								<div>
									<p className="font-medium">Protein</p>
									<p className="text-muted-foreground">
										{recipe.nutritionInfo.protein}
									</p>
								</div>
								<div>
									<p className="font-medium">Carbs</p>
									<p className="text-muted-foreground">
										{recipe.nutritionInfo.carbs}
									</p>
								</div>
								<div>
									<p className="font-medium">Fat</p>
									<p className="text-muted-foreground">
										{recipe.nutritionInfo.fat}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Instructions */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Instructions</CardTitle>
							<CardDescription>
								Follow these steps to create your dish
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recipe.steps.map((step, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									<div key={index} className="flex gap-4">
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
											{index + 1}
										</div>
										<p className="pt-1 text-sm leading-relaxed">{step}</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Advantages */}
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Why You'll Love This Recipe</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-2">
								{recipe.advantages.map((advantage, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									<div key={index} className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-primary" />
										<span className="text-sm">{advantage}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
