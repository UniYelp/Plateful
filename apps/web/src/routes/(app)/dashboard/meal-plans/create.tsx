import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	CheckCircle,
	ChefHat,
	Clock,
	Plus,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/Select";
import {
	availableRecipes,
	type MealPlan,
	mealPlanTags,
	mealTypes,
} from "@/pages/dashboard/meal-plan";

export const Route = createFileRoute("/(app)/dashboard/meal-plans/create")({
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateMealPlanPage />;
}

function CreateMealPlanPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		startDate: "",
		duration: "7", // days
	});
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [allowOutOfStock, setAllowOutOfStock] = useState(false);
	const [mealPlan, setMealPlan] = useState<MealPlan>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [draggedRecipe, setDraggedRecipe] = useState<string | null>(null);
	const [fillDescription, setFillDescription] = useState("");
	const [isAutoFilling, setIsAutoFilling] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const toggleTag = (tagId: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId],
		);
	};

	const handleDragStart = (e: React.DragEvent, recipeId: string) => {
		setDraggedRecipe(recipeId);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, day: string, mealType: string) => {
		e.preventDefault();
		if (draggedRecipe) {
			handleMealChange(day, mealType, draggedRecipe);
			setDraggedRecipe(null);
		}
	};

	const handleMealChange = (
		day: string,
		mealType: string,
		recipeId: string,
	) => {
		setMealPlan((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				[mealType]: recipeId,
			},
		}));
	};

	const removeMeal = (day: string, mealType: string) => {
		setMealPlan((prev) => {
			const newPlan = { ...prev };
			if (newPlan[day]) {
				delete newPlan[day][mealType];
				if (Object.keys(newPlan[day]).length === 0) {
					delete newPlan[day];
				}
			}
			return newPlan;
		});
	};

	const getRecipe = (recipeId: string) => {
		return availableRecipes.find((r) => r.id === recipeId);
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}
		if (!formData.startDate) {
			newErrors.startDate = "Start date is required";
		} else {
			const startDate = new Date(formData.startDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			if (startDate < today) {
				newErrors.startDate = "Start date cannot be in the past";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			setShowSuccess(true);

			// Auto-redirect after showing success
			setTimeout(() => {
				router.navigate({ to: "/dashboard/meal-plans" });
			}, 2000);
		} catch (error) {
			console.error("Failed to create meal plan:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleAutoFillMeals = async () => {
		if (!fillDescription.trim()) {
			setErrors((prev) => ({
				...prev,
				fillDescription:
					"Please describe your preferences for auto-filling meals",
			}));
			return;
		}

		setIsAutoFilling(true);
		setErrors((prev) => ({ ...prev, fillDescription: "" }));

		try {
			// Simulate AI processing
			await new Promise((resolve) => setTimeout(resolve, 3000));

			// Get empty meal slots
			const days = generateDays();
			const emptySlots: Array<{ day: string; mealType: string }> = [];

			days.forEach((day) => {
				mealTypes.forEach((mealType) => {
					if (!mealPlan[day.key]?.[mealType]) {
						emptySlots.push({ day: day.key, mealType });
					}
				});
			});

			// Fill empty slots with appropriate recipes based on meal type and tags
			const newMealPlan = { ...mealPlan };

			emptySlots.forEach((slot) => {
				// Simple logic to assign recipes based on meal type
				let suitableRecipes = availableRecipes;

				if (slot.mealType === "breakfast") {
					suitableRecipes = availableRecipes.filter(
						(r) =>
							r.tags.some((tag) => tag.toLowerCase().includes("breakfast")) ||
							r.cookTime <= 15,
					);
				} else if (slot.mealType === "snack") {
					suitableRecipes = availableRecipes.filter(
						(r) =>
							r.cookTime <= 10 ||
							r.tags.some((tag) => tag.toLowerCase().includes("quick")),
					);
				}

				// Filter by selected tags if any
				if (selectedTags.length > 0) {
					suitableRecipes = suitableRecipes.filter((recipe) =>
						selectedTags.some((tag) =>
							recipe.tags.some(
								(recipeTag) =>
									recipeTag.toLowerCase().includes(tag.toLowerCase()) ||
									tag.toLowerCase().includes(recipeTag.toLowerCase()),
							),
						),
					);
				}

				// Pick a random suitable recipe
				if (suitableRecipes.length > 0) {
					const randomRecipe =
						suitableRecipes[Math.floor(Math.random() * suitableRecipes.length)];
					if (!newMealPlan[slot.day]) {
						newMealPlan[slot.day] = {};
					}
					newMealPlan[slot.day][slot.mealType] = randomRecipe.id;
				}
			});

			setMealPlan(newMealPlan);
			setFillDescription("");
		} catch (error) {
			console.error("Failed to auto-fill meals:", error);
		} finally {
			setIsAutoFilling(false);
		}
	};

	const generateDays = () => {
		const days = [];
		const startDate = new Date(formData.startDate || Date.now());
		const duration = Number.parseInt(formData.duration);

		for (let i = 0; i < duration; i++) {
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
			const dateStr = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
			days.push({ dayName, dateStr, key: `day-${i}` });
		}

		return days;
	};

	if (showSuccess) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-12 w-12 text-green-600" />
					</div>
					<h3 className="mb-2 font-bold text-2xl">
						Meal Plan Created Successfully!
					</h3>
					<p className="mb-4 max-w-md text-muted-foreground">
						"{formData.title}" has been added to your meal plans.
					</p>
					<p className="text-muted-foreground text-sm">
						Redirecting to your meal plans...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-7xl px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/dashboard/meal-plans">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="font-bold text-3xl">Create Meal Plan</h1>
						<p className="text-muted-foreground">
							Plan your meals with drag-and-drop calendar view
						</p>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{/* Left Column - Form and Recipes */}
					<div className="space-y-6 lg:col-span-1">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Plan Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="title">Plan Title *</Label>
									<Input
										id="title"
										placeholder="e.g., Healthy Week, Quick Meals"
										value={formData.title}
										onChange={(e) => handleInputChange("title", e.target.value)}
										className={errors.title ? "border-destructive" : ""}
									/>
									{errors.title && (
										<p className="text-destructive text-sm">{errors.title}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="startDate">Start Date *</Label>
									<Input
										id="startDate"
										type="date"
										value={formData.startDate}
										onChange={(e) =>
											handleInputChange("startDate", e.target.value)
										}
										className={errors.startDate ? "border-destructive" : ""}
									/>
									{errors.startDate && (
										<p className="text-destructive text-sm">
											{errors.startDate}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="duration">Duration</Label>
									<Select
										value={formData.duration}
										onValueChange={(value) =>
											handleInputChange("duration", value)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="3">3 days</SelectItem>
											<SelectItem value="7">1 week</SelectItem>
											<SelectItem value="14">2 weeks</SelectItem>
											<SelectItem value="30">1 month</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Meal Plan Tags</CardTitle>
								<CardDescription>
									Choose preferences for your entire meal plan
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{mealPlanTags.map((tag) => (
										<button
											key={tag.id}
											type="button"
											onClick={() => toggleTag(tag.id)}
											className={`rounded-full px-3 py-2 font-medium text-sm transition-all ${
												selectedTags.includes(tag.id)
													? "bg-primary text-primary-foreground shadow-md"
													: `${tag.color} hover:shadow-sm`
											}`}
										>
											{tag.label}
										</button>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Ingredient Preferences</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="allowOutOfStock"
										checked={allowOutOfStock}
										onCheckedChange={setAllowOutOfStock}
									/>
									<Label htmlFor="allowOutOfStock" className="text-sm">
										Allow recipes with ingredients not currently in stock
									</Label>
								</div>
								<p className="mt-2 text-muted-foreground text-xs">
									When unchecked, only recipes using your available ingredients
									will be suggested
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Available Recipes</CardTitle>
								<CardDescription>
									Drag recipes to your calendar or click to add
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="max-h-96 space-y-3 overflow-y-auto">
									{availableRecipes.map((recipe) => (
										<div
											key={recipe.id}
											draggable
											onDragStart={(e) => handleDragStart(e, recipe.id)}
											className="flex cursor-move items-center gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
										>
											<img
												src={
													recipe.image || "/placeholder.svg?height=60&width=60"
												}
												alt={recipe.title}
												className="h-12 w-12 rounded object-cover"
											/>
											<div className="min-w-0 flex-1">
												<h4 className="truncate font-medium text-sm">
													{recipe.title}
												</h4>
												<p className="truncate text-muted-foreground text-xs">
													{recipe.description}
												</p>
												<div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
													<div className="flex items-center gap-1">
														<Clock className="h-3 w-3" />
														{recipe.cookTime}m
													</div>
													<div className="flex items-center gap-1">
														<Users className="h-3 w-3" />
														{recipe.servings}
													</div>
													<span className="rounded bg-muted px-1.5 py-0.5 text-xs">
														{recipe.difficulty}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Calendar */}
					<div className="lg:col-span-2">
						{!formData.startDate ? (
							<Card>
								<CardHeader>
									<CardTitle>Meal Calendar</CardTitle>
									<CardDescription>
										Select a start date to begin planning your meals
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{[1, 2, 3].map((day) => (
											<div
												key={day}
												className="rounded-lg border bg-muted/20 p-4"
											>
												<div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
												<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
													{mealTypes.map((mealType) => (
														<div key={mealType} className="space-y-2">
															<div className="h-4 w-16 animate-pulse rounded bg-muted" />
															<div className="flex min-h-[100px] items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed p-4">
																<div className="text-center text-muted-foreground/50">
																	<Calendar className="mx-auto mb-2 h-8 w-8" />
																	<p className="text-xs">Awaiting start date</p>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
									<div className="mt-8 p-8 text-center">
										<Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
										<h3 className="mb-2 font-medium text-lg text-muted-foreground">
											Ready to Plan Your Meals?
										</h3>
										<p className="mx-auto max-w-md text-muted-foreground text-sm">
											Choose a start date above to unlock the drag-and-drop meal
											calendar and begin building your perfect meal plan.
										</p>
									</div>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-6">
								<Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-primary">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
												<ChefHat className="h-4 w-4 text-primary" />
											</div>
											AI Meal Assistant
										</CardTitle>
										<CardDescription>
											Let our AI chef fill in the remaining empty meals based on
											your preferences and selected tags
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="fillDescription">
												Describe your meal preferences *
											</Label>
											<textarea
												id="fillDescription"
												placeholder="e.g., I want balanced meals with variety, prefer quick breakfast options, and love Mediterranean flavors for dinner..."
												value={fillDescription}
												onChange={(e) => setFillDescription(e.target.value)}
												className={`min-h-[100px] w-full resize-none rounded-md border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
													errors.fillDescription
														? "border-destructive"
														: "border-input"
												}`}
											/>
											{errors.fillDescription && (
												<p className="text-destructive text-sm">
													{errors.fillDescription}
												</p>
											)}
										</div>

										<Button
											onClick={handleAutoFillMeals}
											disabled={isAutoFilling || !fillDescription.trim()}
											className="w-full transform rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-primary/90 hover:to-secondary/90 hover:shadow-xl"
										>
											{isAutoFilling ? (
												<div className="flex items-center gap-2">
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
													Creating Perfect Meals...
												</div>
											) : (
												<div className="flex items-center gap-2">
													<ChefHat className="h-5 w-5" />✨ Fill My Calendar
													with Delicious Meals
												</div>
											)}
										</Button>

										<p className="text-center text-muted-foreground text-xs">
											This will only fill empty meal slots and respect your
											selected tags and preferences
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Meal Calendar</CardTitle>
										<CardDescription>
											Drag recipes from the left or click to assign meals
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-6">
											{generateDays().map((day) => (
												<div key={day.key} className="rounded-lg border p-4">
													<h3 className="mb-4 font-semibold text-lg">
														{day.dayName} - {day.dateStr}
													</h3>
													<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
														{mealTypes.map((mealType) => (
															<div
																key={mealType}
																className="space-y-2"
																onDragOver={handleDragOver}
																onDrop={(e) => handleDrop(e, day.key, mealType)}
															>
																<Label className="font-medium text-sm capitalize">
																	{mealType}
																</Label>
																{mealPlan[day.key]?.[mealType] ? (
																	<div className="group relative">
																		{(() => {
																			const recipe = getRecipe(
																				mealPlan[day.key][mealType],
																			);
																			return recipe ? (
																				<div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm">
																					<div className="mb-2 flex items-center justify-between">
																						<h5 className="truncate font-medium text-sm">
																							{recipe.title}
																						</h5>
																						<Button
																							type="button"
																							variant="ghost"
																							size="sm"
																							onClick={() =>
																								removeMeal(day.key, mealType)
																							}
																							className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
																						>
																							<X className="h-3 w-3" />
																						</Button>
																					</div>
																					<div className="flex items-center gap-2 text-muted-foreground text-xs">
																						<Clock className="h-3 w-3" />
																						{recipe.cookTime}m
																						<Users className="h-3 w-3" />
																						{recipe.servings}
																					</div>
																					<div className="mt-2 flex flex-wrap gap-1">
																						{recipe.tags
																							.slice(0, 2)
																							.map((tag) => (
																								<span
																									key={tag}
																									className="rounded bg-primary/10 px-1.5 py-0.5 text-primary text-xs"
																								>
																									{tag}
																								</span>
																							))}
																					</div>
																				</div>
																			) : null;
																		})()}
																	</div>
																) : (
																	<div className="flex min-h-[100px] items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed p-4 text-center transition-colors hover:border-primary/50">
																		<div className="text-muted-foreground">
																			<Plus className="mx-auto mb-1 h-6 w-6" />
																			<p className="text-xs">
																				Drop recipe here
																			</p>
																		</div>
																	</div>
																)}
															</div>
														))}
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</div>
				</div>

				{/* Submit Buttons */}
				<div className="mt-8 flex gap-3">
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || !formData.title || !formData.startDate}
						className="flex-1"
					>
						{isSubmitting ? "Creating Meal Plan..." : "Create Meal Plan"}
					</Button>
					<Button type="button" variant="outline" asChild>
						<Link to="/dashboard/meal-plans">Cancel</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
