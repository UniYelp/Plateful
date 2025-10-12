import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Package, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui-0/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui-0/card";
import { Input } from "@/components/ui-0/input";
import { Label } from "@/components/ui-0/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui-0/select";
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
			category: "",
			expiryDate: "",
			image: null as File | null,
		},
		onSubmit: ({ value }) => {
			console.log(value);
		},
	});

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		amount: "",
		category: "",
		expiryDate: "",
		image: null as File | null,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSimilarWarning, setShowSimilarWarning] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}

		// Check for similar ingredients when title changes
		if (field === "title" && value.length > 2) {
			// Mock similar ingredient check
			const similarIngredients = ["Fresh Basil", "Basil Leaves", "Sweet Basil"];
			const hasSimilar = similarIngredients.some(
				(ingredient) =>
					ingredient.toLowerCase().includes(value.toLowerCase()) &&
					ingredient.toLowerCase() !== value.toLowerCase(),
			);
			setShowSimilarWarning(hasSimilar);
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, image: file }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}
		if (!formData.amount.trim()) {
			newErrors.amount = "Amount is required";
		}
		if (!formData.category) {
			newErrors.category = "Category is required";
		}
		if (!formData.expiryDate) {
			newErrors.expiryDate = "Expiry date is required";
		} else {
			const expiryDate = new Date(formData.expiryDate);
			const today = new Date();
			if (expiryDate < today) {
				newErrors.expiryDate = "Expiry date cannot be in the past";
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
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Redirect to ingredients page
			router.navigate({ to: "/dashboard/ingredients" });
		} catch (error) {
			console.error("Failed to add ingredient:", error);
		} finally {
			setIsSubmitting(false);
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
							<div className="space-y-2">
								<Label>Ingredient Photo</Label>
								<div className="flex items-center gap-4">
									<div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50">
										{formData.image ? (
											<img
												src={
													URL.createObjectURL(formData.image) ||
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
											onChange={handleImageUpload}
											className="hidden"
										/>
										<Label htmlFor="image-upload" className="cursor-pointer">
											<Button type="button" variant="outline" size="sm" asChild>
												<span>
													<Upload className="mr-2 h-4 w-4" />
													Upload Photo
												</span>
											</Button>
										</Label>
										<p className="mt-1 text-muted-foreground text-xs">
											Optional: Add a photo to easily identify your ingredient
										</p>
									</div>
								</div>
							</div>

							{/* Title */}
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="title">Title *</Label>
										<Input
											placeholder="e.g., Fresh Basil"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											className={errors.title ? "border-destructive" : ""}
										/>
										{errors.title && (
											<p className="text-destructive text-sm">{errors.title}</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Description */}
							<form.Field name="description">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="description">Description</Label>
										<Textarea
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
								<div className="space-y-2">
									<Label htmlFor="amount">Amount *</Label>
									<Input
										placeholder="e.g., 50g, 1L, 3 pieces"
										value={formData.amount}
										onChange={(e) =>
											handleInputChange("amount", e.target.value)
										}
										className={errors.amount ? "border-destructive" : ""}
									/>
									{errors.amount && (
										<p className="text-destructive text-sm">{errors.amount}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="category">Category *</Label>
									<Select
										value={formData.category}
										onValueChange={(value) =>
											handleInputChange("category", value)
										}
									>
										<SelectTrigger
											className={errors.category ? "border-destructive" : ""}
										>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{ingredientsCategories.map((category) => (
												<SelectItem key={category.value} value={category.value}>
													{category.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.category && (
										<p className="text-destructive text-sm">
											{errors.category}
										</p>
									)}
								</div>
							</div>

							{/* Expiry Date */}
							<div className="space-y-2">
								<Label htmlFor="expiryDate">Expiry Date *</Label>
								<Input
									type="date"
									value={formData.expiryDate}
									onChange={(e) =>
										handleInputChange("expiryDate", e.target.value)
									}
									className={errors.expiryDate ? "border-destructive" : ""}
								/>
								{errors.expiryDate && (
									<p className="text-destructive text-sm">
										{errors.expiryDate}
									</p>
								)}
							</div>

							{/* Submit Buttons */}
							<div className="flex gap-3 pt-4">
								<Button
									type="submit"
									disabled={isSubmitting}
									className="flex-1"
								>
									{isSubmitting ? "Adding..." : "Add Ingredient"}
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
