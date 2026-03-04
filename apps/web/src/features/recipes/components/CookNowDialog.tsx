import { useState } from "react";
import { useMutation } from "convex/react";
import { CheckCircle2, Package, Play, XCircle } from "lucide-react";

import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { getTotalAmount } from "&/ingredients/utils/total-amount";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type UpdatedIngredient = { name: string; quantities: { amount: number; unit?: string }[] };
type CookStep = "confirm" | "success" | "error";

export type CookNowDialogProps = {
	householdId: Id<"households">;
	ingredients: {
		ingredient: { _id: Id<"ingredients">; name: string };
		quantities: { amount: number; unit?: string }[];
	}[];
	children: React.ReactNode;
};

export function CookNowDialog({ householdId, ingredients, children }: CookNowDialogProps) {
	const consumeForRecipe = useMutation(api.ingredients.consumeForRecipe);
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<CookStep>("confirm");
	const [updated, setUpdated] = useState<UpdatedIngredient[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			setStep("confirm");
			setUpdated([]);
			setError(null);
		}
		setOpen(newOpen);
	};

	const handleCook = async () => {
		try {
			const result = await consumeForRecipe({
				householdId,
				ingredients: ingredients.map((ing) => ({
					ingredientId: ing.ingredient._id,
					quantities: ing.quantities,
				})),
			});
			setUpdated(result);
			setStep("success");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Something went wrong.");
			setStep("error");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{children}
			</DialogTrigger>
			<DialogContent>
				{step === "confirm" && (
					<>
						<DialogHeader>
							<DialogTitle>Ready to cook?</DialogTitle>
							<DialogDescription>
								The following ingredients will be deducted from your pantry:
							</DialogDescription>
						</DialogHeader>
						<div className="my-2 max-h-60 overflow-y-auto">
							<div className="space-y-2">
								{ingredients.map((ing) => (
									<div
										key={ing.ingredient._id}
										className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
									>
										<span className="font-medium">{ing.ingredient.name}</span>
										<span className="text-muted-foreground">
											-{getTotalAmount(ing.quantities)}
										</span>
									</div>
								))}
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
							<Button onClick={handleCook}>
								<Play className="mr-2 h-4 w-4" />
								Cook Now
							</Button>
						</DialogFooter>
					</>
				)}

				{step === "success" && (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<CheckCircle2 className="h-5 w-5 text-green-500" />
								Ingredients updated!
							</DialogTitle>
							<DialogDescription>
								Here are the remaining amounts in your pantry:
							</DialogDescription>
						</DialogHeader>
						<div className="my-2 max-h-60 overflow-y-auto">
							<div className="space-y-2">
								{updated.map((ing) => (
									<div
										key={ing.name}
										className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
									>
										<div className="flex items-center gap-2">
											<Package className="h-3.5 w-3.5 text-muted-foreground" />
											<span className="font-medium">{ing.name}</span>
										</div>
										{ing.quantities.length > 0 ? (
											<span className="text-muted-foreground">
												{getTotalAmount(ing.quantities)} remaining
											</span>
										) : (
											<span className="text-muted-foreground italic">All used up</span>
										)}
									</div>
								))}
							</div>
						</div>
						<DialogFooter>
							<Button onClick={() => setOpen(false)}>Done</Button>
						</DialogFooter>
					</>
				)}

				{step === "error" && (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<XCircle className="h-5 w-5 text-destructive" />
								Something went wrong
							</DialogTitle>
							<DialogDescription>{error}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={() => setStep("confirm")}>Try again</Button>
							<Button variant="destructive" onClick={() => setOpen(false)}>Close</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
