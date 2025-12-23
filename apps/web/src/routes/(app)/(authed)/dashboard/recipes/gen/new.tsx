import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, History, Package } from "lucide-react";

import {
	getExpiryDetailsFromExpiryDate,
	getExpiryDetailsFromExpiryDates,
} from "@plateful/ingredients";
import { isDefined } from "@plateful/utils";
import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { useCurrentHousehold } from "&/households/hooks/useCurrentHouseholds";
import { recipesLoader } from "&/recipes/components/loaders/recipes";
import { GenerateRecipeForm } from "&/recipes/form/components/GenerateRecipeForm";
import type { RecipeGenForm } from "&/recipes/form/schemas";
import type { IngredientDetails } from "&/recipes/form/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute(
	"/(app)/(authed)/dashboard/recipes/gen/new",
)({
	staticData: {
		links: [
			{
				to: "/dashboard/recipes/gen",
				label: "History",
				icon: <History className="mr-2 h-4 w-4" />,
			},
		],
	},
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

	const hasAvailableIngredients = !!ingredientsDetails?.length;

	const onSubmit = async (value: RecipeGenForm) => {
		if (!household || !hasAvailableIngredients || !value.ingredients.length)
			return;

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
				recipesLoader
			) : !ingredientsDetails.length ? (
				<Card className="py-12 text-center">
					<CardContent className="space-y-6">
						<div className="flex justify-center">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
								<Package className="h-10 w-10 text-muted-foreground" />
							</div>
						</div>
						<div className="space-y-2">
							<h3 className="font-bold text-2xl">No Ingredients Yet</h3>
							<p className="mx-auto max-w-md text-muted-foreground">
								To start generating recipes, you need to add ingredients to your
								household first. Add your available ingredients so we can create
								personalized recipes for you.
							</p>
						</div>
						<Button size="lg" asChild>
							<Link to="/dashboard/ingredients">
								<Package className="mr-2 h-4 w-4" />
								Add Ingredients
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<GenerateRecipeForm
					ingredients={ingredientsDetails}
					onSubmit={onSubmit}
				/>
			)}
		</div>
	);
}
