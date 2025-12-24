import type { StandardSchemaV1Issue } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { AlertCircle, ArrowLeft, Package } from "lucide-react";
import { useState } from "react";

import { type IngredientUnit, ingredientUnits } from "@plateful/ingredients";
import { api } from "@backend/api";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { ingredientsCategories } from "&/ingredients/constants";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { addIngredientFormDefaultValues } from "@/features/ingredients/forms/constants";
import { AddIngredientFormSchema, INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH } from "@/features/ingredients/forms/schemas";
import { useAppForm } from "@/lib/form";
import type { IngredientsCategoriesMap } from "@/pages/dashboard/ingredients";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/ingredients/add",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <AddIngredientPage />;
}

const mapErrors = (errors: (string | StandardSchemaV1Issue | undefined)[]) =>
	errors
		.map((err) => {
			if (typeof err === "string") {
				return err;
			} else if (err && "message" in err) {
				return err.message;
			}
			return "";
		})
		.join(", ");

function AddIngredientPage() {
	const router = useRouter();
	const form = useAppForm({
		defaultValues: addIngredientFormDefaultValues,
		validators: {
			onChange: AddIngredientFormSchema,
			onSubmit: ({ value }) => {
				if (!value.name) {
					return {
						fields: {
							name: "Name must be set.",
						},
					};
				}

				// TODO create similar ingredient warning
			},
		},
		onSubmit: async ({ value }) => {
			try {
				if (!householdId) {
					throw new Error("No household found for the user.");
				}

				const expiryDate = value.expiryDate
					? new Date(value.expiryDate).getTime()
					: undefined;

				// Simulate API call
				const submitting = addIngredient({
					name: value.name,
					description: value.description,
					quantities: [
						{
							unit: value.unit,
							expiresAt: expiryDate,
							amount: value.amount,
						},
					],
					// images: value.image,
					householdId: householdId,
					category: value.category,
					tags: [],
					images: [],
				});
				await submitting;

				// Redirect to ingredients page
				router.navigate({ to: "/dashboard/ingredients" });
			} catch (error) {
				console.error("Failed to add ingredient:", error);
			}
		},
	});

	const [showSimilarWarning, setShowSimilarWarning] = useState(false);
	const addIngredient = useMutation(api.ingredients.addIngredient);

	const householdId = useCurrentHousehold()?._id;

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-2xl px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/dashboard/ingredients">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="font-bold text-3xl">Add Ingredient</h1>
						<p className="text-muted-foreground">
							Add a new ingredient to your kitchen inventory
						</p>
					</div>
				</div>

				{/* Similar Ingredient Warning */}
				{showSimilarWarning && (
					<Card className="mb-6 border-amber-200 bg-amber-50">
						<CardContent className="p-4">
							<div className="flex items-start gap-3">
								<AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
								<div>
									<h4 className="font-medium text-amber-800">
										Similar ingredient found
									</h4>
									<p className="mt-1 text-amber-700 text-sm">
										We found similar ingredients in your inventory. Would you
										like to update the existing amount instead?
									</p>
									<div className="mt-3 flex gap-2">
										<Button
											size="sm"
											variant="outline"
											className="border-amber-300 bg-transparent text-amber-700"
										>
											Update Existing
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setShowSimilarWarning(false)}
										>
											Add New
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Add Ingredient Form */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							Ingredient Details
						</CardTitle>
						<CardDescription>
							Fill in the details for your new ingredient
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							<form.AppForm>
								{/* Title */}
								<form.Field name="name">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="title">Title *</Label>
											<Input
												placeholder="e.g., Fresh Basil"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												className={
													!field.state.meta.isValid ? "border-destructive" : ""
												}
											/>
											{!field.state.meta.isValid && (
												<p className="text-destructive text-sm">
													{mapErrors(field.state.meta.errors)}
												</p>
											)}
										</div>
									)}
								</form.Field>

								{/* Description */}
								<form.Field name="description">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="description">Description</Label>
											<TextArea
												placeholder="e.g., Organic fresh basil leaves from local farm"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												rows={3}
												maxLength={INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH}
											/>
											{!field.state.meta.isValid && (
												<p className="text-destructive text-sm">
													{mapErrors(field.state.meta.errors)}
												</p>
											)}
										</div>
									)}
								</form.Field>
								{/* Amount and Category */}
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<form.AppField name="amount">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor="amount">Amount *</Label>
												<Input
													placeholder="e.g., 50, 1, 0.5"
													value={field.state.value}
													type="number"
													onChange={(e) =>
														field.handleChange(e.target.valueAsNumber)
													}
													className={
														!field.state.meta.isValid
															? "border-destructive"
															: ""
													}
												/>
												{!field.state.meta.isValid && (
													<p className="text-destructive text-sm">
														{mapErrors(field.state.meta.errors)}
													</p>
												)}
											</div>
										)}
									</form.AppField>
									<form.AppField name="unit">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor="unit">Unit *</Label>
												<Select
													value={field.state.value}
													onValueChange={(value) =>
														field.handleChange(value as IngredientUnit)
													}
												>
													<SelectTrigger
														className={
															!field.state.meta.isValid
																? "border-destructive"
																: ""
														}
													>
														<SelectValue placeholder="Select Unit" />
													</SelectTrigger>
													<SelectContent>
														{ingredientUnits.map((unit) => (
															<SelectItem key={unit} value={unit}>
																{unit}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{!field.state.meta.isValid && (
													<p className="text-destructive text-sm">
														{mapErrors(field.state.meta.errors)}
													</p>
												)}
											</div>
										)}
									</form.AppField>

									<form.AppField name="category">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor="category">Category *</Label>
												<Select
													value={field.state.value}
													onValueChange={(value) =>
														field.handleChange(
															value as IngredientsCategoriesMap,
														)
													}
												>
													<SelectTrigger
														className={
															!field.state.meta.isValid
																? "border-destructive"
																: ""
														}
													>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
													<SelectContent>
														{ingredientsCategories.map((category) => (
															<SelectItem
																key={category.value}
																value={category.value}
															>
																{category.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{!field.state.meta.isValid && (
													<p className="text-destructive text-sm">
														{mapErrors(field.state.meta.errors)}
													</p>
												)}
											</div>
										)}
									</form.AppField>
								</div>

								{/* Expiry Date */}
								<form.AppField name="expiryDate">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="expiryDate">Expiry Date</Label>
											<Input
												type="date"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												className={
													!field.state.meta.isValid ? "border-destructive" : ""
												}
											/>
											{!field.state.meta.isValid && (
												<p className="text-destructive text-sm">
													{mapErrors(field.state.meta.errors)}
												</p>
											)}
										</div>
									)}
								</form.AppField>

								{/* Submit Buttons */}
								<div className="flex gap-3 pt-4">
									<form.SubmitButton className="flex-1">
										{form.state.isSubmitting ? "Adding..." : "Add Ingredient"}
									</form.SubmitButton>
									<Button type="button" variant="outline" asChild>
										<Link to="/dashboard/ingredients">Cancel</Link>
									</Button>
								</div>
							</form.AppForm>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
