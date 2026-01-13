import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, BookOpen, Edit2, Package2, Trash2 } from "lucide-react";

import {
	type ExpiryDetails,
	getExpiryDetailsFromExpiryDates,
} from "@plateful/ingredients";
import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import {
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/ingredients/$id/",
)({
	loader: async ({ context }) => {
		context.queryClient;
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <IngredientDetailPage />;
}

export function IngredientDetailPage() {
	const navigate = Route.useNavigate();

	const household = useCurrentHousehold();

	const { id: ingredientId } = Route.useParams();

	const ingredient = useQuery(
		api.ingredients.byId,
		household
			? {
					householdId: household._id,
					ingredientId: ingredientId as Id<"ingredients">,
				}
			: "skip",
	);

	const recipes = useQuery(
		api.recipeIngredients.byIngredient,
		household && ingredient
			? { householdId: household._id, ingredientId: ingredient._id }
			: "skip",
	);

	const deleteIngredient = useMutation(api.ingredients.deleteIngredient);

	if (!household || !ingredient) return "Loading...";

	const getTotalAmount = () => {
		const grouped = ingredient.quantities.reduce(
			(acc, q) => {
				const unit = q.unit || "undefined";
				if (!acc[unit]) acc[unit] = 0;
				acc[unit] += q.amount;
				return acc;
			},
			{} as Record<string, number>,
		);

		return Object.entries(grouped)
			.map(([unit, amount]) => `${amount}${unit}`)
			.join(", ");
	};

	const deleteIngredientHandler = async () => {
		await deleteIngredient({
			ingredientId: ingredient._id,
			householdId: household?._id,
		});

		navigate({ to: "/dashboard/ingredients" });
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-5xl px-4 py-8">
				<div className="mb-8 flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/dashboard/ingredients">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Link>
					</Button>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Main Info */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<div className="flex items-start gap-4">
								<img
									src={
										ingredientImgByCategory[
											ingredient.category as keyof typeof ingredientImgByCategory
										]
									}
									alt={ingredient.name}
									className="h-24 w-24 rounded-lg bg-muted object-cover"
								/>

								<div className="flex-1">
									<CardTitle className="mb-2 text-2xl">
										{ingredient.name}
									</CardTitle>
									<p className="mb-2 text-muted-foreground">
										{ingredient.description}
									</p>
									<div className="flex items-center gap-4">
										<Badge variant="outline">{ingredient.category}</Badge>
										<span className="text-muted-foreground text-sm">
											Total:{" "}
											<span className="font-semibold">{getTotalAmount()}</span>
										</span>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold">
									Quantities ({ingredient.quantities.length})
								</h3>
							</div>

							<div className="space-y-2">
								{ingredient.quantities.map((q, index) => {
									const status: ExpiryDetails | null = q.expiresAt
										? getExpiryDetailsFromExpiryDates([
												new Date(q.expiresAt).getTime(),
											])
										: { status: "good", text: "No Expiry date" };
									return (
										<button
											key={`quantity-${index}-${q.amount}-${q.unit}-${q.expiresAt}`}
											type="button"
											className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
										>
											<div className="flex-1">
												<span className="font-medium">
													{q.amount}
													{q.unit}
												</span>
											</div>
											<div className="flex items-center gap-3">
												{status && (
													<Badge
														variant={colorByExpiryStatus[status.status]}
														className="text-xs"
													>
														{status.text}
													</Badge>
												)}
											</div>
										</button>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Sidebar */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<BookOpen className="h-5 w-5" />
									Used In Recipes
								</CardTitle>
							</CardHeader>

							<CardContent>
								<div className="space-y-2">
									{recipes ? (
										recipes.length === 0 ? (
											<p className="text-muted-foreground text-sm">
												This ingredient is not used in any recipes.
											</p>
										) : (
											recipes.map(
												(recipe) =>
													recipe && (
														<Link
															key={recipe._id}
															to="/dashboard/recipes/$id"
															params={{ id: recipe._id }}
															className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
														>
															<span className="font-medium text-sm">
																{recipe.title}
															</span>
														</Link>
													),
											)
										)
									) : (
										"Loading..."
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Package2 className="h-5 w-5" />
									Actions
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									variant="outline"
									className="w-full justify-start bg-transparent"
								>
									<Link
										to="/dashboard/ingredients/$id/edit"
										params={{ id: ingredientId }}
										className="flex items-center"
									>
										<Edit2 className="mr-2 h-4 w-4" />
										Edit Ingredient
									</Link>
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											className="w-full justify-start bg-transparent text-destructive hover:text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete Ingredient
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
											<AlertDialogAction onClick={deleteIngredientHandler}>
												Continue
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
