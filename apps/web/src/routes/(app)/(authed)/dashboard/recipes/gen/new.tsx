import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";

import {
	getExpiryDetailsFromExpiryDate,
	getExpiryDetailsFromExpiryDates,
} from "@plateful/ingredients";
import { isDefined } from "@plateful/utils";
import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import type { RecipeGenForm } from "&/recipes/form/schemas";
import type { IngredientDetails } from "&/recipes/form/types";
import { Button } from "@/components/ui/button";
import { GenerateRecipeForm } from "@/features/recipes/form/components/GenerateRecipeForm";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/recipes/gen/new",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <GenerateNewRecipePage />;
}

function GenerateNewRecipePage() {
	const household = useCurrentHousehold();

	const ingredients = useQuery(
		api.ingredients.byHousehold,
		household ? { householdId: household._id } : "skip",
	);

	const startGeneratingRecipe = useMutation(api.recipeGens.start);
    
	const navigate = Route.useNavigate();

	const ingredientsDetails = ingredients?.map<IngredientDetails>((ing) => {
		const nonExpiredQuantities = ing.quantities.flatMap((quantity) => {
			const expiryDetails = isDefined(quantity.expiresAt)
				? getExpiryDetailsFromExpiryDate(quantity.expiresAt)
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

		const expiryStatusDetails = getExpiryDetailsFromExpiryDates(expirations);

		return {
			id: ing._id,
			name: ing.name,
			category: ing.category,
			availableQuantities: nonExpiredQuantities,
			expiry: expiryStatusDetails,
		};
	});

	const onSubmit = async (value: RecipeGenForm) => {
		if (!household || !ingredientsDetails || !value.ingredients.length) return;

		const selectedIngredients = new Set(
			value.ingredients as Id<"ingredients">[],
		);

		const genId = await startGeneratingRecipe({
			householdId: household._id,
			tags: value.tags,
			ingredients: ingredientsDetails.flatMap((ing) => {
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
	};

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
			{!ingredientsDetails ? (
				"Loading..."
			) : !ingredientsDetails?.length ? (
				"No Available Ingredients..."
			) : (
				<GenerateRecipeForm
					ingredients={ingredientsDetails}
					onSubmit={onSubmit}
				/>
			)}
		</div>
	);
}
