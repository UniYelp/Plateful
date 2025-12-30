import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { AlertCircle, ArrowLeft, Package } from "lucide-react";
import { useState } from "react";

import { api } from "@backend/api";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { IngredientForm } from "&/ingredients/forms/IngredientForm";
import type { IngredientFormValues } from "&/ingredients/forms/schemas";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/ingredients/add",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <AddIngredientPage />;
}

function AddIngredientPage() {
	const navigate = Route.useNavigate();

	const [showSimilarWarning, setShowSimilarWarning] = useState(false);
	const addIngredient = useMutation(api.ingredients.add);

	const householdId = useCurrentHousehold()?._id;

	const onSubmit = async (value: IngredientFormValues) => {
		try {
			if (!householdId) {
				throw new Error("No household found for the user.");
			}

			const expiryDate = value.expiryDate
				? new Date(value.expiryDate).getTime()
				: undefined;

			const _ingredientId = await addIngredient({
				name: value.name,
				description: value.description,
				quantities: [
					{
						unit: value.unit,
						expiresAt: expiryDate,
						amount: value.amount,
					},
				],
				householdId: householdId,
				category: value.category,
				tags: [],
				images: [],
			});

			// TODO: navigate to the newly created ingredient detail page
			navigate({ to: "/dashboard/ingredients" });
		} catch (error) {
			// TODO: handle error properly
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
						<IngredientForm onSubmit={onSubmit} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
