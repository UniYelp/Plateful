import { Link } from "@tanstack/react-router";
import { AlertCircle, ChefHat, ExternalLink } from "lucide-react";

import type { RecipeGenDoc } from "@backend/recipeGens";
import {
	isCompletedRecipeGen,
	isFailedRecipeGen,
	isGeneratingRecipe,
} from "&/recipes/utils/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	RecipeGenStatusSmall,
	stageStatusDetails,
} from "./loaders/recipe-gen-status";


type Props = {
	gen: RecipeGenDoc;
	title?: string;
};

export const RecipeGenState = (props: Props) => {
	const { gen, title } = props;

	return (
		<Card className="overflow-hidden">
			<CardContent className="relative flex items-center gap-4 px-6">
				<span className="absolute top-0 right-6 whitespace-nowrap text-muted-foreground text-xs">
					{new Date(gen._creationTime).toLocaleDateString()}
				</span>
				{isGeneratingRecipe(gen) && (
					<>
						<div className="relative shrink-0">
							<RecipeGenStatusSmall currentStep={gen.state.status} />
						</div>

						<div className="mb-1 flex w-full flex-col justify-center">
							<h3 className="font-semibold text-base">Generating Recipe</h3>
							<h5 className="text-muted-foreground text-sm">
								{
									stageStatusDetails.find((s) => s.id === gen.state.status)
										?.description
								}
							</h5>
						</div>
					</>
				)}

				{isFailedRecipeGen(gen) && (
					<>
						<div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
							<AlertCircle className="h-5 w-5 text-destructive" />
						</div>

						<div className="min-w-0 flex-1">
							<div className="mb-2 flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<h3 className="font-semibold text-base">
											Generation Failed
										</h3>
										<Badge variant="destructive" className="text-xs">
											Error
										</Badge>
									</div>
									<p className="text-destructive/80 text-sm italic">
										{gen.state.reason}
									</p>
								</div>
							</div>
						</div>
					</>
				)}

				{isCompletedRecipeGen(gen) && (
					<>
						<div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
							<ChefHat className="h-5 w-5" />
						</div>
						<div className="mt-4 flex w-full justify-between">
							<div>{title}</div>

							<div className="min-w-0">
								<Button size="sm" asChild>
									<Link
										to={`/dashboard/recipes/$id`}
										params={{ id: gen.state.recipeId }}
									>
										<ExternalLink className="mr-2 h-3 w-3" />
										View Recipe
									</Link>
								</Button>
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};
