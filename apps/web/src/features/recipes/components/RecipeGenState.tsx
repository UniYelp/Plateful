import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, ChefHat, ExternalLink, RotateCcw } from "lucide-react";

import { api } from "@backend/api";
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
	const retryGen = useMutation(api.recipeGens.retry);

	const generationsStats = useQuery(api.recipeGens.stats, {
		householdId: gen.householdId,
	});

	const isQuotaReached =
		generationsStats &&
		generationsStats.today.total >= generationsStats.today.max;

	const handleRetry = async () => {
		await retryGen({ genId: gen._id, householdId: gen.householdId });
	};

	return (
		<Card className="overflow-hidden">
			<CardContent className="flex flex-col gap-3 px-6">
				<div className="flex items-center gap-4">
					{isGeneratingRecipe(gen) && (
					<>
						<div className="relative shrink-0">
							<RecipeGenStatusSmall currentStep={gen.state.status} />
						</div>
						<div className="flex w-full items-center justify-between">
							<div className="mb-1 flex w-full flex-col justify-center">
								<h3 className="font-semibold text-base">Generating Recipe</h3>
								<h5 className="text-muted-foreground text-sm">
									{
										stageStatusDetails.find((s) => s.id === gen.state.status)
											?.description
									}
								</h5>
							</div>
							<div className="flex justify-end">
								<span className="whitespace-nowrap text-muted-foreground text-xs">
									{new Date(gen._creationTime).toLocaleDateString()}
								</span>
							</div>
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
								<div className="min-w-0 flex-1 flex flex-col justify-center">
									<div className="mb-1 mt-2 flex items-center gap-2">
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
								
								<div className="min-w-max self-center flex flex-col gap-2">
									<div className="flex justify-end">
										<span className="whitespace-nowrap text-muted-foreground text-xs">
											{new Date(gen._creationTime).toLocaleDateString()}
										</span>
									</div>
									<Button 
										onClick={handleRetry} 
										size="sm" 
										variant="outline" 
										className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
										disabled={isQuotaReached}
									>
										<RotateCcw className="mr-2 h-3 w-3" />
										Retry
									</Button>
									{isQuotaReached && (
										<p className="text-destructive text-[10px] text-right">Quota Reached</p>
									)}
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
						<div className="flex w-full justify-between">
							<div className="mt-4">{title}</div>

							<div className="min-w-max flex flex-col gap-2">
								<div className="flex justify-end">
									<span className="whitespace-nowrap text-muted-foreground text-xs">
										{new Date(gen._creationTime).toLocaleDateString()}
									</span>
								</div>
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
			</div>
			</CardContent>
		</Card>
	);
};
