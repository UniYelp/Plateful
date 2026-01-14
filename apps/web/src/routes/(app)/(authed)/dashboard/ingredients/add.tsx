import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeft, Package } from "lucide-react";

import { api } from "@backend/api";
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
	"/(app)/(authed)/dashboard/ingredients/add",
)({
	loader: ({ context }) => {
		const { household } = context;
		return { householdId: household._id };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <AddIngredientPage />;
}

function AddIngredientPage() {
	const { householdId } = Route.useLoaderData();
	const navigate = Route.useNavigate();

	const addIngredient = useMutation(api.ingredients.add);

	const onSubmit = async (value: IngredientFormOutput) => {
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
			householdId,
			category: value.category,
			tags: [],
			images: [],
		});

		navigate({
			to: "/dashboard/ingredients/$id",
			params: { id: _ingredientId },
		});
	};

	return (
		<>
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
					<IngredientForm householdId={householdId} onSubmit={onSubmit} />
				</CardContent>
			</Card>
		</>
	);
}
