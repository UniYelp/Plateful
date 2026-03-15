import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Package } from "lucide-react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
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
	loader: ({ context }) => {
		const { household } = context;
		return { householdId: household._id };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <EditIngredientPage />;
}

function EditIngredientPage() {
	const { householdId } = Route.useLoaderData();
	const navigate = Route.useNavigate();

	const editIngredient = useMutation(api.ingredients.edit);

	const { id: paramIngredientId } = Route.useParams();

	const ingredient = useQuery(api.ingredients.byId, {
		householdId,
		ingredientId: paramIngredientId as Id<"ingredients">,
	});

	const recipeIngredients = useQuery(api.recipeIngredients.fullByIngredient, {
		householdId,
		ingredientId: paramIngredientId as Id<"ingredients">,
	});

	const onSubmit = async (value: IngredientFormOutput) => {
		const quantities = value.quantities.map((q) => ({
			unit: q.unit,
			expiresAt: q.expiryDate ? new Date(q.expiryDate).getTime() : undefined,
			amount: q.amount,
		}));

		const ingredientId = await editIngredient({
			ingredientId: paramIngredientId as Id<"ingredients">,
			name: value.name,
			description: value.description,
			quantities,
			householdId,
			category: value.category,
			tags: [],
			images: [],
		});

		navigate({
			to: "/dashboard/ingredients/$id",
			params: { id: ingredientId },
		});
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-2xl px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link
							to="/dashboard/ingredients/$id"
							params={{ id: paramIngredientId }}
						>
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
							householdId={householdId}
							relatedRecipes={recipeIngredients?.map((ri) => ri.recipe)}
							defaultValues={{
								name: ingredient?.name,
								description: ingredient?.description,
								category: ingredient?.category,
								quantities: ingredient?.quantities?.length
									? ingredient.quantities.map((q) => ({
											amount: q.amount,
											unit: q.unit,
											expiryDate: q.expiresAt
												? new Date(q.expiresAt).toISOString().split("T")[0]
												: undefined,
										}))
									: [{ amount: NaN }],
							}}
							submitAction="Edit"
							onSubmit={onSubmit}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
