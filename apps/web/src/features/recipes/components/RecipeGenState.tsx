import { Link } from "@tanstack/react-router";
import { AlertCircle, ChefHat, ExternalLink, Loader2 } from "lucide-react";

import type { RecipeGenDoc } from "@backend/recipeGens";
import {
	isCompletedRecipeGen,
	isFailedRecipeGen,
	isGeneratingRecipe,
} from "&/recipes/utils/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
	gen: RecipeGenDoc;
};

export const RecipeGenState = (props: Props) => {
	const { gen } = props;

	return (
		<Card className="overflow-hidden">
			<CardContent className="relative flex items-center gap-4 px-6">
				<span className="absolute top-0 right-6 whitespace-nowrap text-muted-foreground text-xs">
					{new Date(gen._creationTime).toLocaleDateString()}
				</span>
				{isGeneratingRecipe(gen) && (
					<>
						<div className="relative shrink-0">
							<div className="flex h-15 w-15 items-center justify-center rounded-lg bg-primary/10">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
							</div>
							<div className="absolute inset-0 animate-pulse rounded-lg border-2 border-primary/20" />
						</div>

						<div className="min-w-0 flex-1">
							<div className="mb-2 flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<h3 className="font-semibold text-base">
											Generating Recipe...
										</h3>
										<Badge variant="secondary" className="text-xs">
											<Loader2 className="mr-1 h-3 w-3 animate-spin" />
											In Progress
										</Badge>
									</div>
								</div>
							</div>

							<div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
								<div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
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

						<div className="min-w-0 flex-1">
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
					</>
				)}
			</CardContent>
		</Card>
	);
};
