import { useMutation } from "convex/react";
import { CheckCircle2, Package, Play, XCircle } from "lucide-react";
import { useState } from "react";

import { api } from "@backend/api";
import type { Doc, Id } from "@backend/dataModel";
import { getTotalAmount } from "&/ingredients/utils/total-amount";
import { calculateRecipeMaxPortions } from "&/recipes/utils/available-ingredients";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UpdatedIngredient = {
	name: string;
	quantities: { amount: number; unit?: string }[];
};
type CookStep = "confirm" | "success" | "error";

export type CookNowDialogProps = {
	householdId: Id<"households">;
	ingredients: Array<{
		ingredient: Doc<"ingredients">;
		quantities: Doc<"recipeIngredients">["quantities"];
	}>;
	children: React.ReactNode;
};

export function CookNowDialog({
	householdId,
	ingredients,
	children,
}: CookNowDialogProps) {
	const consumeForRecipe = useMutation(api.ingredients.consumeForRecipe);
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<CookStep>("confirm");
	const [updated, setUpdated] = useState<UpdatedIngredient[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [portions, setPortions] = useState(1);

	const maxPortions = calculateRecipeMaxPortions(ingredients);

	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			setStep("confirm");
			setUpdated([]);
			setError(null);
			setPortions(1);
		}
		setOpen(newOpen);
	};

	const handleCook = async () => {
		try {
			const result = await consumeForRecipe({
				householdId,
				ingredients: ingredients.map((ing) => ({
					ingredientId: ing.ingredient._id,
					quantities: ing.quantities.map((q) => ({
						...q,
						amount: q.amount * portions,
					})),
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
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				{step === "confirm" && (
					<>
						<DialogHeader>
							<DialogTitle>Ready to cook?</DialogTitle>
						</DialogHeader>

						<div className="my-4 border-b pb-4">
							<Label
								htmlFor="portions"
								className="mb-2 block font-medium text-sm"
							>
								How many portions are you cooking?
							</Label>
							<div className="flex items-center gap-3">
								<Input
									id="portions"
									type="number"
									min={1}
									max={maxPortions}
									value={portions}
									onChange={(e) => {
										const val = e.target.valueAsNumber;
										if (!Number.isNaN(val)) {
											setPortions(Math.min(maxPortions, Math.max(1, val)));
										}
									}}
									className="w-24"
								/>
								<span className="text-muted-foreground text-sm">
									Maximum possible:{" "}
									{maxPortions === Number.POSITIVE_INFINITY
										? "Unlimited"
										: maxPortions}
								</span>
							</div>
						</div>

						<p className="mt-4 text-muted-foreground text-sm">
							The following ingredients will be deducted from your pantry:
						</p>
						<div className="my-2 max-h-60 overflow-y-auto">
							<div className="space-y-2">
								{ingredients.map((ing) => (
									<div
										key={ing.ingredient._id}
										className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
									>
										<span className="font-medium">{ing.ingredient.name}</span>
										<span className="text-muted-foreground">
											-
											{getTotalAmount(
												ing.quantities.map((q) => ({
													...q,
													amount: q.amount * portions,
												})),
											)}
										</span>
									</div>
								))}
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleCook}
								disabled={portions > maxPortions || portions < 1}
							>
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
											<span className="text-muted-foreground italic">
												All used up
											</span>
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
							<Button variant="outline" onClick={() => setStep("confirm")}>
								Try again
							</Button>
							<Button variant="destructive" onClick={() => setOpen(false)}>
								Close
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
