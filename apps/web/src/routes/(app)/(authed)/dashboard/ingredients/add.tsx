import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { AlertCircle, ArrowLeft, Package, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { api } from "@backend/api";
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
import { useCurrentHousehold } from "@/features/households/hooks/useCurrentHouseholds";
import { ingredientsCategories } from "@/pages/dashboard/ingredients";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/ingredients/add",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <AddIngredientPage />;
}

function AddIngredientPage() {
	const router = useRouter();
	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			amount: "",
			unit: "",
			category: "",
			expiryDate: "",
			image: null as File | null,
		},
		onSubmit: ({ value }) => {
			console.log(value);
		},
	});

	const [showSimilarWarning, setShowSimilarWarning] = useState(false);
	const addIngredient = useMutation(api.ingredients.addIngredient);

	const householdId = useCurrentHousehold()?._id;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (!householdId) {
				throw new Error("No household found for the user.");
			}

			const expiryDate = form.state.values.expiryDate
				? new Date(form.state.values.expiryDate).getTime()
				: undefined;

			const amountNumber = Number(form.state.values.amount);
			if (!amountNumber || amountNumber <= 0) {
				throw new Error("Amount must be a positive number.");
			}

			// Simulate API call
			const submitting = addIngredient({
				name: form.state.values.name,
				description: form.state.values.description,
				quantities: [
					{
						unit: form.state.values.unit,
						expiresAt: expiryDate,
						amount: amountNumber,
					},
				],
				// images: form.state.values.image,
				householdId: householdId,
				category: form.state.values.category,
				tags: [],
				images: [],
			});
			await submitting;

			// Redirect to ingredients page
			router.navigate({ to: "/dashboard/ingredients" });
		} catch (error) {
			console.error("Failed to add ingredient:", error);
		}
	};

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
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Image Upload */}
							<form.Field name="image">
								{(field) => (
									<div className="space-y-2">
										<Label>Ingredient Photo</Label>
										<div className="flex items-center gap-4">
											<div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50">
												{field.state.value ? (
													<img
														src={
															URL.createObjectURL(field.state.value) ||
															"/placeholder.svg"
														}
														alt="Preview"
														className="h-full w-full rounded-lg object-cover"
													/>
												) : (
													<Upload className="h-6 w-6 text-muted-foreground" />
												)}
											</div>
											<div>
												<Input
													type="file"
													accept="image/*"
													name={field.name}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) => {
														console.log(e.target.files?.[0]);
														const file = e.target.files?.[0] || null;
														field.handleChange(file);
													}}
													// className="hidden"
												/>
												{/* <Label
													htmlFor="image-upload"
													className="cursor-pointer"
												>
													<Button
														type="button"
														variant="outline"
														size="sm"
														asChild
													>
														<span>
															<Upload className="mr-2 h-4 w-4" />
															Upload Photo
														</span>
													</Button>
												</Label> */}
												<p className="mt-1 text-muted-foreground text-xs">
													Optional: Add a photo to easily identify your
													ingredient
												</p>
											</div>
										</div>
									</div>
								)}
							</form.Field>

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
												{field.state.meta.errors.join(", ")}
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
										/>
									</div>
								)}
							</form.Field>
							{/* Amount and Category */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<form.Field name="amount">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="amount">Amount *</Label>
											<Input
												placeholder="e.g., 50g, 1L, 3 pieces"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												className={
													!field.state.meta.isValid ? "border-destructive" : ""
												}
											/>
											{!field.state.meta.isValid && (
												<p className="text-destructive text-sm">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
										</div>
									)}
								</form.Field>
								<form.Field name="unit">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="unit">Unit *</Label>
											<Input
												placeholder="e.g., gram, liter, oz"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												className={
													!field.state.meta.isValid ? "border-destructive" : ""
												}
											/>
											{!field.state.meta.isValid && (
												<p className="text-destructive text-sm">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
										</div>
									)}
								</form.Field>

								<form.Field name="category">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="category">Category *</Label>
											<Select
												value={field.state.value}
												onValueChange={(value) => field.handleChange(value)}
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
													{field.state.meta.errors.join(", ")}
												</p>
											)}
										</div>
									)}
								</form.Field>
							</div>

							{/* Expiry Date */}
							<form.Field name="expiryDate">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="expiryDate">Expiry Date *</Label>
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
												{field.state.meta.errors.join(", ")}
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Submit Buttons */}
							<div className="flex gap-3 pt-4">
								<Button
									type="submit"
									disabled={form.state.isSubmitting}
									className="flex-1"
								>
									{form.state.isSubmitting ? "Adding..." : "Add Ingredient"}
								</Button>
								<Button type="button" variant="outline" asChild>
									<Link to="/dashboard/ingredients">Cancel</Link>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
