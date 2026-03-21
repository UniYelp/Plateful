import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, BookOpen, Combine, Edit2, Package2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
	type ExpiryDetails,
	getExpiryDetailsFromExpiryDates,
	IngredientSymbol,
	ingredientUnitsByCategory,
} from "@plateful/ingredients";
import { entriesOf } from "@plateful/utils";
import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { DeleteIngredientButton } from "&/ingredients/components/DeleteIngredientButton";
import {
	colorByExpiryStatus,
	ingredientImgByCategory,
} from "&/ingredients/constants";
import { IngredientQuantitySchema } from "&/ingredients/forms/schemas";
import { getTotalAmount } from "&/ingredients/utils/total-amount";
import { submitFormHandler } from "&/forms/utils/submission";
import { focusInvalid, isInvalidTouched } from "&/forms/utils/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useAppForm } from "@/lib/form";
import { z } from "zod";

const ingredientUnitGroups = entriesOf(ingredientUnitsByCategory).map(
	([label, units]) => ({
		label,
		options: units.map((unit) => {
			const symbol = IngredientSymbol[unit];
			return {
				value: unit as string,
				label: `${unit}${symbol !== unit ? ` (${symbol})` : ""}`,
			};
		}),
	}),
);

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/ingredients/$id/",
)({
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
		api.recipeIngredients.fullByIngredient,
		household && ingredient
			? { householdId: household._id, ingredientId: ingredient._id }
			: "skip",
	);

	const addQuantity = useMutation(api.ingredients.addQuantity);
	const removeQuantityAt = useMutation(api.ingredients.removeQuantityAt);
	const mergeQuantities = useMutation(api.ingredients.mergeQuantities);

	const [addOpen, setAddOpen] = useState(false);

	const form = useAppForm({
		defaultValues: {
			amount: NaN,
			unit: undefined,
			expiryDate: undefined,
		} as z.infer<typeof IngredientQuantitySchema>,
		validators: {
			onChange: IngredientQuantitySchema,
		},
		onSubmitInvalid: focusInvalid,
		onSubmit: async ({ value }) => {
			if (!household || !ingredient) return;
			await addQuantity({
				householdId: household._id,
				ingredientId: ingredient._id,
				amount: value.amount,
				unit: value.unit,
				expiresAt: value.expiryDate ? new Date(value.expiryDate).getTime() : undefined,
			});
			setAddOpen(false);
			form.reset();
		},
	});

	if (!household || !ingredient) return "Loading...";

	const totalAmount = getTotalAmount(ingredient.quantities);

	const handleRemoveQuantity = async (index: number) => {
		await removeQuantityAt({
			householdId: household._id,
			ingredientId: ingredient._id,
			index,
		});
	};

	const handleMergeQuantities = async () => {
		await mergeQuantities({
			ingredientId: ingredient._id,
			householdId: household._id,
		});
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
								{/* TODO: const getProperty = <T extends object>(obj: T, key: SuggestStr<keyof T>, defaultValue: ValueOf<T>) => key in obj ? obj[key] : defaultValue; */}
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
											<span className="font-semibold">{totalAmount || "0"}</span>
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
								<div className="flex gap-2">
									{ingredient.quantities.length > 1 && (
										<Button
											size="sm"
											variant="secondary"
											onClick={handleMergeQuantities}
										>
											<Combine className="mr-1 h-3 w-3" />
											Merge Quantities
										</Button>
									)}
								<Popover open={addOpen} onOpenChange={(open) => {
									setAddOpen(open);
									if (!open) form.reset();
								}}>
									<PopoverTrigger asChild>
										<Button size="sm" variant="outline">
											<Plus className="mr-1 h-3 w-3" />
											Add Quantity
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-64 p-4" align="end">
										<p className="mb-3 font-medium text-sm">Add a quantity slot</p>
										<form onSubmit={submitFormHandler(form)} className="space-y-3">
											<form.AppForm>
												<form.AppField name="amount">
													{(field) => (
														<div>
															<Label className="mb-1 text-xs">Amount *</Label>
															<Input
																type="number"
																min="0"
																step="any"
																placeholder="e.g. 500"
																value={Number.isFinite(field.state.value) ? field.state.value : ""}
																aria-invalid={isInvalidTouched(field)}
																onChange={(e) => field.handleChange(e.target.valueAsNumber)}
															/>
															<field.FieldError />
														</div>
													)}
												</form.AppField>
												<form.AppField name="unit">
													{(field) => (
														<div>
															<Label className="mb-1 text-xs">Unit (optional)</Label>
															<Combobox<string>
																value={field.state.value ?? ""}
																onChange={(value) => field.handleChange(value || undefined)}
																groups={ingredientUnitGroups}
															/>
															<field.FieldError />
														</div>
													)}
												</form.AppField>
												<form.AppField name="expiryDate">
													{(field) => (
														<div>
															<Label className="mb-1 text-xs">Expiry Date (optional)</Label>
															<Input
																type="date"
																value={field.state.value ?? ""}
																aria-invalid={isInvalidTouched(field)}
																onChange={(e) => field.handleChange(e.target.value || undefined)}
															/>
															<field.FieldError />
														</div>
													)}
												</form.AppField>
												<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
													{([canSubmit, isSubmitting]) => (
														<Button
															type="submit"
															size="sm"
															className="w-full"
															disabled={!canSubmit || isSubmitting}
														>
															Add
														</Button>
													)}
												</form.Subscribe>
											</form.AppForm>
										</form>
									</PopoverContent>
								</Popover>
								</div>
							</div>

							<div className="space-y-2">
								{ingredient.quantities.length === 0 && (
									<p className="text-center text-muted-foreground text-sm py-4">
										No quantities — add one above.
									</p>
								)}
								{ingredient.quantities.map((q, index) => {
									const status: ExpiryDetails | null = q.expiresAt
										? getExpiryDetailsFromExpiryDates([
												new Date(q.expiresAt).getTime(),
											])
										: { status: "good", text: "No Expiry date" };
									return (
										<div
											key={`quantity-${index}-${q.amount}-${q.unit}-${q.expiresAt}`}
											className="flex w-full items-center justify-between rounded-lg border p-3"
										>
											<div className="flex-1">
												<span className="font-medium">
													{q.amount}
													{q.unit ? ` ${q.unit}` : ""}
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
												<Button
													size="sm"
													variant="ghost"
													className="h-7 w-7 p-0 text-destructive hover:text-destructive"
													onClick={() => handleRemoveQuantity(index)}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										</div>
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
									{!recipes && "Loading..."}
									{recipes?.length === 0 && (
										<p className="text-muted-foreground text-sm">
											This ingredient is not used in any recipes.
										</p>
									)}
									{recipes?.map(
										(recipe) =>
											recipe && (
												<Link
													key={recipe.recipe._id}
													to="/dashboard/recipes/$id"
													params={{ id: recipe.recipe._id }}
													className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
												>
													<span className="font-medium text-sm">
														{recipe.recipe.title}
													</span>
													<span className="text-muted-foreground text-xs">
														{getTotalAmount(recipe.quantities)}
													</span>
												</Link>
											),
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
									asChild
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

								<DeleteIngredientButton
									variant="full"
									ingredientId={ingredient._id}
									householdId={household._id}
									onDeleted={() => navigate({ to: "/dashboard/ingredients" })}
								/>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
