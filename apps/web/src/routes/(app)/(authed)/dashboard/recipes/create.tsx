import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle,
	ChefHat,
	Clock,
	Sparkles,
	Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea_dsdg";
import {
	availableIngredients,
	quickTags,
	recipeOptions,
} from "@/pages/dashboard/recipes";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/recipes/create",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateRecipePage />;
}

function CreateRecipePage() {
	const router = useRouter();
	const [step, setStep] = useState<
		"input" | "generating" | "options" | "success"
	>("input");
	const [recipeDescription, setRecipeDescription] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [createdRecipe, setCreatedRecipe] =
		useState<(typeof recipeOptions)[number]>();

	const toggleTag = (tagId: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId],
		);
	};

	const handleGenerateRecipes = async () => {
		if (!recipeDescription.trim()) return;

		setStep("generating");
		// Simulate AI recipe generation with user input
		await new Promise((resolve) => setTimeout(resolve, 3000));
		setStep("options");
	};

	const handleSelectRecipe = async (optionId: string) => {
		setSelectedOption(optionId);
		const recipe = recipeOptions.find((r) => r.id === optionId);

		// Simulate creating the recipe
		await new Promise((resolve) => setTimeout(resolve, 1500));

		setCreatedRecipe(recipe);
		setStep("success");

		// Auto-redirect after showing success
		setTimeout(() => {
			router.navigate({ to: `/dashboard/recipes/${optionId}` });
		}, 2000);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-4xl px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/dashboard/recipes">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="font-bold text-3xl">Create Recipe</h1>
						<p className="text-muted-foreground">
							Tell us what you want to eat and we'll create the perfect recipe
						</p>
					</div>
				</div>

				{step === "input" && (
					<>
						{/* Recipe Description Input */}
						<Card className="mb-6">
							<CardHeader>
								<CardTitle>What do you want to eat?</CardTitle>
								<CardDescription>
									Describe the dish you're craving in detail
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="description">Recipe Description</Label>
									<Textarea
										// id="description"
										placeholder="e.g., I want a creamy pasta dish with chicken and vegetables that's not too heavy but still filling. Something that takes about 30 minutes to make and uses ingredients I probably have at home..."
										value={recipeDescription}
										onChange={(e) => setRecipeDescription(e.target.value)}
										className="min-h-[120px] resize-none"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Quick Tags */}
						<Card className="mb-6">
							<CardHeader>
								<CardTitle>Quick Tags</CardTitle>
								<CardDescription>
									Select any preferences that apply to your recipe
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{quickTags.map((tag) => (
										<button
											key={tag.id}
											type="button"
											onClick={() => toggleTag(tag.id)}
											className={`flex items-center gap-2 rounded-full px-3 py-2 font-medium text-sm transition-all ${
												selectedTags.includes(tag.id)
													? `${tag.selectedColor} scale-105 transform shadow-lg ring-2 ring-primary/20 ring-offset-2`
													: `${tag.color} hover:scale-102 hover:shadow-sm`
											}`}
										>
											<span className="text-base">{tag.icon}</span>
											{tag.label}
											{selectedTags.includes(tag.id) && (
												<div className="h-2 w-2 animate-pulse rounded-full bg-white" />
											)}
										</button>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Available Ingredients */}
						<Card className="mb-8">
							<CardHeader>
								<CardTitle>Your Available Ingredients</CardTitle>
								<CardDescription>
									We'll prioritize using these ingredients from your kitchen
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{availableIngredients.map((ingredient) => (
										<div
											key={ingredient}
											className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
										>
											{ingredient}
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Generate Button */}
						<Card>
							<CardContent className="p-8 text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<Sparkles className="h-8 w-8 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold text-xl">Ready to Create?</h3>
								<p className="mx-auto mb-6 max-w-md text-muted-foreground">
									Our AI will analyze your description, preferences, and
									available ingredients to create personalized recipe options.
								</p>
								<Button
									size="lg"
									onClick={handleGenerateRecipes}
									disabled={!recipeDescription.trim()}
									className="px-8"
								>
									<Sparkles className="mr-2 h-4 w-4" />
									Generate Recipe Options
								</Button>
							</CardContent>
						</Card>
					</>
				)}

				{step === "generating" && (
					<div className="flex min-h-[400px] flex-col items-center justify-center text-center">
						<div className="relative mb-8">
							<div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
								<ChefHat className="h-12 w-12 animate-bounce text-primary" />
							</div>
							<div className="-top-2 -right-2 absolute">
								<Sparkles className="h-8 w-8 animate-pulse text-primary" />
							</div>
						</div>
						<h3 className="mb-2 font-bold text-2xl">
							Creating Your Perfect Recipe
						</h3>
						<p className="mb-4 max-w-md text-muted-foreground">
							Our AI chef is analyzing your preferences and crafting
							personalized recipes just for you...
						</p>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
							<div
								className="h-2 w-2 animate-pulse rounded-full bg-primary"
								style={{ animationDelay: "0.2s" }}
							/>
							<div
								className="h-2 w-2 animate-pulse rounded-full bg-primary"
								style={{ animationDelay: "0.4s" }}
							/>
						</div>
					</div>
				)}

				{step === "options" && (
					<>
						{/* Recipe Options */}
						<div className="mb-6">
							<h2 className="mb-2 font-bold text-2xl">Choose Your Recipe</h2>
							<p className="text-muted-foreground">
								Select one of these personalized recipes based on your
								description and preferences
							</p>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							{recipeOptions.map((option) => (
								<Card
									key={option.id}
									className={`cursor-pointer transition-all hover:shadow-md ${
										selectedOption === option.id ? "ring-2 ring-primary" : ""
									}`}
									onClick={() => handleSelectRecipe(option.id)}
								>
									<div className="relative">
										<img
											src={option.image || "/placeholder.svg"}
											alt={option.title}
											className="h-48 w-full rounded-t-lg object-cover"
										/>
										<div className="absolute top-3 right-3">
											<div className="rounded-full bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
												{option.difficulty}
											</div>
										</div>
									</div>

									<CardContent className="p-4">
										<h3 className="mb-2 font-semibold text-lg">
											{option.title}
										</h3>
										<p className="mb-3 text-muted-foreground text-sm">
											{option.description}
										</p>

										<div className="mb-3 flex items-center gap-4 text-muted-foreground text-sm">
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{option.cookTime}m
											</div>
											<div className="flex items-center gap-1">
												<Users className="h-3 w-3" />
												{option.servings} servings
											</div>
										</div>

										<div className="mb-3">
											<p className="mb-1 font-medium text-sm">Ingredients:</p>
											<div className="flex flex-wrap gap-1">
												{option.ingredients.map((ingredient) => (
													<span
														key={ingredient}
														className="rounded bg-muted px-2 py-0.5 text-xs"
													>
														{ingredient}
													</span>
												))}
											</div>
										</div>

										<div className="mb-4">
											<p className="mb-1 font-medium text-sm">Tags:</p>
											<div className="flex flex-wrap gap-1">
												{option.tags.map((tag) => (
													<span
														key={tag}
														className="rounded bg-primary/10 px-2 py-0.5 text-primary text-xs"
													>
														{tag}
													</span>
												))}
											</div>
										</div>

										<Button
											className="w-full"
											disabled={
												selectedOption !== null && selectedOption !== option.id
											}
										>
											{selectedOption === option.id ? (
												<>
													<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
													Creating Recipe...
												</>
											) : (
												"Select This Recipe"
											)}
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</>
				)}

				{step === "success" && createdRecipe && (
					<div className="flex min-h-[400px] flex-col items-center justify-center text-center">
						<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
							<CheckCircle className="h-12 w-12 text-green-600" />
						</div>
						<h3 className="mb-2 font-bold text-2xl">
							Recipe Created Successfully!
						</h3>
						<p className="mb-4 max-w-md text-muted-foreground">
							"{createdRecipe.title}" has been added to your recipe collection.
						</p>
						<p className="text-muted-foreground text-sm">
							Redirecting to your new recipe...
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
