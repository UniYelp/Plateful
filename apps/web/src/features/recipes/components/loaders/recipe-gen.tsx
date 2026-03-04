import { ChefHat, Sparkles } from "lucide-react";

export const generatingRecipeLoader = (
	<div className="flex min-h-100 flex-col items-center justify-center">
		<div className="relative">
			<ChefHat className="h-16 w-16 animate-bounce text-primary" />
			<Sparkles className="-top-5 -right-5 absolute h-6 w-6 animate-pulse text-primary" />
		</div>
		<h3 className="mt-6 mb-2 font-bold text-2xl">
			Creating Your Perfect Recipe
		</h3>
		<p className="text-muted-foreground">
			Analyzing your ingredients and preferences...
		</p>
	</div>
);
