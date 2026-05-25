import { usePostHog } from "@posthog/react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, ChefHat, ExternalLink, RotateCcw } from "lucide-react";
import { toast } from "sonner";

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
import { DAY } from "@/constants";
import {
	RecipeGenStatusSmall,
	stageStatusDetails,
} from "./loaders/recipe-gen-status";

type Props = {
	gen: RecipeGenDoc;
	title?: string;
};

const now = Date.now();

export const RecipeGenState = (props: Props) => {
	const { gen, title } = props;
	const posthog = usePostHog();

	const retryGen = useMutation(api.recipeGens.retry);

	const generationsStats = useQuery(api.recipeGens.stats, {
		householdId: gen.householdId,
	});

	const isQuotaReached =
		generationsStats &&
		generationsStats.today.total >= generationsStats.today.max;

	const isOutdated = gen._creationTime < now - DAY;

	const handleRetry = async () => {
		posthog?.capture("recipe_gen_retry", {
			genId: gen._id,
			hasQuota: !isQuotaReached,
			isOutdated,
		});

		try {
			await retryGen({ genId: gen._id, householdId: gen.householdId });
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to retry generation",
			);
		}
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
								<div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
									<div className="flex min-w-0 flex-1 flex-col justify-center">
										<span className="text-muted-foreground text-xs sm:hidden">
											{new Date(gen._creationTime).toLocaleDateString()}
										</span>
										<div className="mt-2 mb-1 flex items-center gap-2">
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

									<div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:min-w-max sm:flex-col sm:items-end sm:justify-start sm:gap-2 sm:self-center">
										<span className="hidden text-muted-foreground text-xs sm:inline">
											{new Date(gen._creationTime).toLocaleDateString()}
										</span>
										{!isOutdated && (
											<Button
												onClick={handleRetry}
												size="sm"
												variant="outline"
												className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
												disabled={isQuotaReached}
											>
												<RotateCcw className="mr-2 h-3 w-3" />
												Retry
											</Button>
										)}
										{isQuotaReached && (
											<p className="text-right text-[10px] text-destructive">
												Quota Reached
											</p>
										)}
									</div>
								</div>
							</div>
						</>
					)}

					{isCompletedRecipeGen(gen) && (
						<>
							<div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<ChefHat className="h-5 w-5" />
							</div>
							<div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
								<div className="mt-1 flex flex-col justify-center">
									<span className="text-muted-foreground text-xs sm:hidden">
										{new Date(gen._creationTime).toLocaleDateString()}
									</span>
									<div className="font-medium text-base">{title}</div>
								</div>

								<div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:min-w-max sm:flex-col sm:items-end sm:justify-start sm:gap-2">
									<span className="hidden text-muted-foreground text-xs sm:inline">
										{new Date(gen._creationTime).toLocaleDateString()}
									</span>
									<Button size="sm" asChild className="w-full sm:w-auto">
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
