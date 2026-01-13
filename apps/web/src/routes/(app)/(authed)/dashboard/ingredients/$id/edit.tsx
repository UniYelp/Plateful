import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, ArrowLeft, Package } from "lucide-react";
import { useState } from "react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { IngredientForm } from "&/ingredients/forms/IngredientForm";
import type { IngredientFormOutput } from "&/ingredients/forms/schemas";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/ingredients/$id/edit",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <EditIngredientPage />;
}

function EditIngredientPage() {
	const navigate = Route.useNavigate();

	const [showSimilarWarning, setShowSimilarWarning] = useState(false);
	const editIngredient = useMutation(api.ingredients.edit);

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

	const onSubmit = async (value: IngredientFormOutput) => {
		try {
			if (!household) {
				throw new Error("No household found for the user.");
			}

			const expiryDate = value.expiryDate
				? new Date(value.expiryDate).getTime()
				: undefined;

			const _ingredientId = await editIngredient({
				ingredientId: ingredientId as Id<"ingredients">,
				name: value.name,
				description: value.description,
				quantities: [
					{
						unit: value.unit,
						expiresAt: expiryDate,
						amount: value.amount,
					},
				],
				householdId: household._id,
				category: value.category,
				tags: [],
				images: [],
			});

			navigate({
				to: "/dashboard/ingredients/$id",
				params: { id: _ingredientId },
			});
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
						<Link to="/dashboard/ingredients/$id" params={{ id: ingredientId }}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="font-bold text-3xl">Edit Ingredient</h1>
						<p className="text-muted-foreground">
							Update your ingredient details
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
										We found similar ingredients in your inventory. We cannot
										patch the ingredient. Would you like to choose another name?
									</p>
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
						<IngredientForm
							onSubmit={onSubmit}
							defaultValues={{
								name: ingredient?.name,
								description: ingredient?.description,
								category: ingredient?.category,
								amount: ingredient?.quantities[0]?.amount,
								unit: ingredient?.quantities[0]?.unit,
								expiryDate: ingredient?.quantities[0]?.expiresAt
									? new Date(ingredient?.quantities[0]?.expiresAt)
											.toISOString()
											.split("T")[0]
									: undefined,
							}}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
