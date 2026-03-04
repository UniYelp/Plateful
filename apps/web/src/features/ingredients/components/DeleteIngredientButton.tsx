import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { BookOpen, Trash2 } from "lucide-react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type DeleteIngredientButtonProps = {
	ingredientId: Id<"ingredients">;
	householdId: Id<"households">;
	variant?: "icon" | "full";
	onDeleted?: () => void;
};

export function DeleteIngredientButton({
	ingredientId,
	householdId,
	variant = "icon",
	onDeleted,
}: DeleteIngredientButtonProps) {
	const deleteIngredient = useMutation(api.ingredients.deleteIngredient);
	const recipes = useQuery(api.recipeIngredients.fullByIngredient, {
		householdId,
		ingredientId,
	});

	const isLinked = recipes && recipes.length > 0;

	const handleDelete = async () => {
		await deleteIngredient({ ingredientId, householdId });
		if (onDeleted) onDeleted();
	};

	const triggerButton =
		variant === "full" ? (
			<Button
				variant="outline"
				className="w-full justify-start bg-transparent text-destructive hover:text-destructive"
			>
				<Trash2 className="mr-2 h-4 w-4" />
				Delete Ingredient
			</Button>
		) : (
			<Button
				variant="outline"
				size="sm"
				className="bg-transparent text-destructive hover:text-destructive"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		);

	if (isLinked) {
		const linkedTriggerButton =
			variant === "full" ? (
				<Button
					variant="outline"
					className="w-full justify-start bg-transparent text-muted-foreground"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Ingredient
				</Button>
			) : (
				<Button
					variant="outline"
					size="sm"
					className="bg-transparent text-muted-foreground"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			);

		return (
			<Popover>
				<PopoverTrigger asChild>{linkedTriggerButton}</PopoverTrigger>
				<PopoverContent className="w-64 p-3" align="end">
					<p className="mb-2 font-medium text-sm">Cannot delete</p>
					<p className="mb-3 text-muted-foreground text-xs">
						This ingredient is used in {recipes.length} recipe
						{recipes.length !== 1 ? "s" : ""}:
					</p>
					<div className="space-y-1">
						{recipes.map((r) => (
							<Link
								key={r.recipe._id}
								to="/dashboard/recipes/$id"
								params={{ id: r.recipe._id }}
								className="flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors hover:bg-muted"
							>
								<BookOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
								{r.recipe.title}
							</Link>
						))}
					</div>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. You won't be able to restore the
						ingredient data after deletion.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
