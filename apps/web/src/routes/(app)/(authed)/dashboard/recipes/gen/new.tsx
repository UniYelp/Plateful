import { useStore } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Sparkles } from "lucide-react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { ariaInvalid, focusInvalid } from "&/forms/utils/validation";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { quickTags } from "&/recipes/constants";
import {
	type RecipeGenForm,
	RecipeGenFormSchema,
} from "&/recipes/form/schemas";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { submitFormHandler } from "@/features/forms/utils/submission";
import { ingredientImgByCategory } from "@/features/ingredients/constants";
import { ingredientSymbolToDisplay } from "@/features/ingredients/utils/ingredient-symbol-to-display";
import { useAppForm } from "@/lib/form";
import {
	getExpiryStatusDetailsFromExpiryDate,
	getExpiryStatusDetailsFromExpiryDates,
} from "@plateful/ingredients";
import { isDefined } from "@plateful/utils";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/recipes/gen/new",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <GenerateNewRecipePage />;
}

function GenerateNewRecipePage() {
	const navigate = Route.useNavigate();

	const form = useAppForm({
		defaultValues: {
			tags: [],
			ingredients: [],
		} as RecipeGenForm,
		validators: {
			onChange: RecipeGenFormSchema,
		},
		onSubmitInvalid: (props) => {
			console.log("invalid", props);
			focusInvalid();
		},
		onSubmit: async ({ value }) => {
			if (!household || !ingredientDetails) return;

			const selectedIngredients = new Set(
				value.ingredients as Id<"ingredients">[],
			);

			const genId = await startGeneratingRecipe({
				householdId: household._id,
				tags: value.tags,
				ingredients: ingredientDetails.flatMap((ing) => {
					if (!selectedIngredients.has(ing.id)) return [];

					const quantities = ing.availableQuantities.flatMap(
						({ amount, unit, state, expiresAt, expiry }) =>
							expiry?.status === "expired" //? Not really a valid state
								? []
								: {
										amount,
										unit,
										state,
										expiresAt,
									},
					);

					return {
						id: ing.id,
						name: ing.name,
						quantities: quantities.length ? quantities : "unlimited",
					};
				}),
			});

			navigate({
				to: "/dashboard/recipes/gen/$id",
				params: {
					id: genId,
				},
			});
		},
	});

	const household = useCurrentHousehold();

	const ingredients = useQuery(
		api.ingredients.byHousehold,
		household ? { householdId: household._id } : "skip",
	);

	const startGeneratingRecipe = useMutation(api.recipeGens.start);

	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	const ingredientDetails = ingredients?.map((ing) => {
		const nonExpiredQuantities = ing.quantities.flatMap((quantity) => {
			const expiryDetails = isDefined(quantity.expiresAt)
				? getExpiryStatusDetailsFromExpiryDate(quantity.expiresAt)
				: null;

			if (expiryDetails?.status === "expired") return [];

			return {
				...quantity,
				expiry: expiryDetails,
			};
		});

		const expirations = ing.quantities.flatMap(
			(quantity) => quantity.expiresAt ?? [],
		);

		const expiryStatusDetails =
			getExpiryStatusDetailsFromExpiryDates(expirations);

		return {
			id: ing._id,
			name: ing.name,
			category: ing.category,
			availableQuantities: nonExpiredQuantities,
			expiry: expiryStatusDetails,
		};
	});

	const isSubmittingDisabled = !ingredients;

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8 flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/dashboard/recipes">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Link>
				</Button>
				<div>
					<h1 className="font-bold text-3xl">Generate Recipe</h1>
					<p className="text-muted-foreground">
						Let us craft the perfect recipe for you
					</p>
				</div>
			</div>
			<form onSubmit={submitFormHandler(form)}>
				<form.AppForm>
					<div className="flex flex-col gap-8">
						<Card>
							<CardHeader>
								<CardTitle>Quick Tags</CardTitle>
								<CardDescription>
									Select dietary preferences and meal characteristics
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form.AppField name="tags">
									{(field) => (
										<ToggleGroup
											disabled={isSubmitting}
											type="multiple"
											variant="outline"
											onValueChange={field.handleChange}
											aria-invalid={ariaInvalid(field)}
											className="flex flex-wrap gap-2.5"
										>
											{quickTags.map((tag) => (
												<ToggleGroupItem
													key={tag.value}
													value={tag.value}
													aria-label={`Toggle ${tag.value}`}
													className="rounded-lg border-2 px-4 py-2 font-medium text-sm transition-all duration-200 data-[state=on]:scale-105 data-[state=off]:border-border data-[state=on]:border-primary data-[state=off]:bg-background data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:shadow-sm data-[state=off]:hover:border-primary/50 data-[state=off]:hover:bg-muted data-[state=off]:hover:text-black"
												>
													<span>{tag.icon}</span> {tag.label}
												</ToggleGroupItem>
											))}
										</ToggleGroup>
									)}
								</form.AppField>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Ingredients</CardTitle>
								<CardDescription>
									Select the ingredients you would want in your recipe
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form.AppField name="ingredients">
									{(field) => (
										<ToggleGroup
											disabled={isSubmitting}
											type="multiple"
											variant="outline"
											onValueChange={field.handleChange}
											aria-invalid={ariaInvalid(field)}
											className="flex flex-wrap gap-2.5"
										>
											{ingredientDetails?.map((ing) => (
												<ToggleGroupItem
													key={ing.id}
													value={ing.id}
													aria-label={`Toggle ${ing.name}`}
													className="flex items-center gap-3 rounded-lg border-2 px-2 py-3 font-medium text-sm transition-all duration-200 data-[state=on]:scale-105 data-[state=off]:border-border data-[state=on]:border-primary data-[state=off]:bg-background data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:shadow-sm data-[state=off]:hover:border-primary/50 data-[state=off]:hover:bg-muted data-[state=off]:hover:text-black"
												>
													<img
														src={
															ingredientImgByCategory[
																ing.category as keyof typeof ingredientImgByCategory
															]
														}
														alt={ing.name}
														className="h-10 w-10 rounded-lg object-cover"
													/>
													<div className="flex flex-col items-start justify-start">
														<p className="font-medium text-sm">{ing.name}</p>
														<p className="text-muted-foreground text-xs">
															{ing.availableQuantities.length ? (
																<>
																	Available:{" "}
																	<span>
																		{ing.availableQuantities
																			.map((quantity) =>
																				`${quantity.amount} ${ingredientSymbolToDisplay(
																					quantity.unit ?? "",
																				)} ${
																					quantity.state
																						? ` (${quantity.state})`
																						: ""
																				}`.trim(),
																			)
																			.join(", ")}
																	</span>
																</>
															) : (
																"Unlimited"
															)}
														</p>
													</div>
												</ToggleGroupItem>
											))}
										</ToggleGroup>
									)}
								</form.AppField>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-8 text-center">
								<Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
								<form.SubmitButton disabled={isSubmittingDisabled}>
									<Sparkles className="mr-2 h-4 w-4" />
									Generate Recipe
								</form.SubmitButton>
							</CardContent>
						</Card>
					</div>
				</form.AppForm>
			</form>
		</div>
	);
}
