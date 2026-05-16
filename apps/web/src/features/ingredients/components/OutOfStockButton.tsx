import { useMutation } from "convex/react";
import { PackageX } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";

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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type OutOfStockButtonProps = {
	ingredientId: Id<"ingredients">;
	householdId: Id<"households">;
	isDisabled?: boolean;
	variant?: "icon" | "full";
};

export function OutOfStockButton({
	ingredientId,
	householdId,
	isDisabled,
	variant = "icon",
}: OutOfStockButtonProps) {
	const posthog = usePostHog();
	const setOutOfStock = useMutation(api.ingredients.setOutOfStock);

	const handleSetOutOfStock = async () => {
		posthog?.capture("ingredient_out_of_stock", {
			ingredientId,
			householdId,
		});

		toast.promise(setOutOfStock({ ingredientId, householdId }), {
			success: "Ingredient marked as out of stock",
			error: "Failed to mark ingredient as out of stock",
		});
	};

	const triggerButton =
		variant === "full" ? (
			<Button
				variant="outline"
				className="w-full justify-start bg-transparent text-muted-foreground"
				disabled={isDisabled}
			>
				<PackageX className="mr-2 h-4 w-4" />
				Mark as out of stock
			</Button>
		) : (
			<Button
				variant="outline"
				size="sm"
				className="bg-transparent text-muted-foreground hover:text-foreground"
				disabled={isDisabled}
			>
				<PackageX className="h-4 w-4" />
				<span className="sr-only">Mark as out of stock</span>
			</Button>
		);

	if (isDisabled) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
				<TooltipContent>
					<p>Already out of stock</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<AlertDialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Mark as out of stock</p>
				</TooltipContent>
			</Tooltip>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Mark as out of stock?</AlertDialogTitle>
					<AlertDialogDescription>
						This will set all quantities of this ingredient to zero. You can
						always add them back later.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleSetOutOfStock}>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
