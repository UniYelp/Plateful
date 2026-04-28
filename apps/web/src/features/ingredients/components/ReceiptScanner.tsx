import { useStore } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
	IngredientSymbol,
	type IngredientUnit,
	ingredientUnitsByCategory,
} from "@plateful/ingredients";
import { entriesOf } from "@plateful/utils";
import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { submitFormHandler } from "&/forms/utils/submission";
import { focusInvalid, isInvalidTouched } from "&/forms/utils/validation";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/configs/api.config";
import { ingredientsCategoriesOptions } from "@/features/ingredients/constants";
import { useAppForm } from "@/lib/form";
import type { SelectGroup, SelectOption } from "@/types/ui/select";

const ScannedIngredientSchema = z.object({
	name: z.string().min(1, "Name is required"),
	amount: z.number().min(0.01, "Amount must be greater than 0"),
	unit: z.string().optional(),
	description: z.string().optional(),
	category: z.string().min(1, "Category is required"),
	expiresAt: z.string().optional(),
});

const ReceiptScannerSchema = z.object({
	ingredients: z.array(ScannedIngredientSchema),
});

type ReceiptScannerForm = z.infer<typeof ReceiptScannerSchema>;

const ingredientUnitGroups = entriesOf(ingredientUnitsByCategory).map(
	([label, units]) =>
		({
			label,
			options: units.map((unit) => {
				const symbol = IngredientSymbol[unit];

				return {
					value: unit,
					label: `${unit} ${symbol !== unit ? `(${symbol})` : ""}`.trim(),
				} satisfies SelectOption<IngredientUnit>;
			}),
		}) satisfies SelectGroup<IngredientUnit>,
);

export function ReceiptScanner({
	householdId,
}: {
	householdId: Id<"households">;
}) {
	const upsertIngredients = useMutation(api.ingredients.upsertIngredients);
	const [open, setOpen] = useState(false);
	const [isExtracting, setIsExtracting] = useState(false);

	const form = useAppForm({
		defaultValues: {
			ingredients: [],
		} as ReceiptScannerForm,
		validators: {
			onChange: ReceiptScannerSchema,
		},
		onSubmitInvalid: focusInvalid,
		onSubmit: async ({ value }) => {
			if (value.ingredients.length === 0) return;

			try {
				const ingredientsToSubmit = value.ingredients.map((ing) => ({
					...ing,
					expiresAt: ing.expiresAt
						? new Date(ing.expiresAt).getTime()
						: undefined,
				}));

				await upsertIngredients({
					householdId,
					ingredients: ingredientsToSubmit,
				});

				toast.success("Ingredients added successfully");
				setOpen(false);
				form.reset();
			} catch (err) {
				toast.error("Failed to add ingredients");
			}
		},
	});

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsExtracting(true);
		try {
			const { data, error } = await apiClient.receipts.parse.post({
				image: file,
			});

			if (error) {
				throw new Error(
					error.value?.message || "Failed to extract ingredients",
				);
			}

			if (data) {
				form.setFieldValue(
					"ingredients",
					data.ingredients.map(
						(ing: {
							name: string;
							amount: number;
							unit?: string;
							description?: string;
							category?: string;
						}) => {
							const rawCategory = ing.category?.toLowerCase() || "";
							const matchedCategory =
								ingredientsCategoriesOptions.find(
									(opt) =>
										opt.value === rawCategory ||
										opt.label.toLowerCase() === rawCategory ||
										opt.value.startsWith(rawCategory), // Handle singular vs plural
								)?.value || "other";

							return {
								name: ing.name,
								amount: ing.amount,
								unit: (ing.unit?.toLowerCase() || "") as IngredientUnit,
								description: ing.description || "",
								category: matchedCategory,
							};
						},
					),
				);
			}
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setIsExtracting(false);
		}
	};

	const handleAddRow = () => {
		form.pushFieldValue("ingredients", {
			name: "",
			amount: 1,
			unit: "gram",
			category: "produce",
			description: "",
		});
	};

	const ingredients = useStore(form.store, (state) => state.values.ingredients);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<Camera className="h-4 w-4" />
					Scan Receipt
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Scan Receipt</DialogTitle>
					<DialogDescription>
						Upload an image of your receipt to automatically extract
						ingredients.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={submitFormHandler(form)}>
					<div className="grid gap-4 py-4">
						{ingredients.length === 0 && !isExtracting ? (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
								<Camera className="mb-4 h-12 w-12 text-muted-foreground" />
								<p className="mb-4 text-muted-foreground text-sm">
									Click the button below to upload a receipt image.
								</p>
								<Label htmlFor="receipt-upload" className="cursor-pointer">
									<div className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
										Choose Image
									</div>
									<input
										id="receipt-upload"
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleFileChange}
									/>
								</Label>
							</div>
						) : isExtracting ? (
							<div className="flex flex-col items-center justify-center p-12">
								<Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
								<p className="font-medium text-lg">Extracting ingredients...</p>
								<p className="mb-2 text-center text-muted-foreground text-sm">
									This may take a few seconds.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="overflow-x-auto rounded-md border">
									<table className="w-full text-sm">
										<thead className="border-b bg-muted/50">
											<tr>
												<th className="px-4 py-2 text-left font-medium">
													Name
												</th>
												<th className="w-24 px-4 py-2 text-left font-medium">
													Amount
												</th>
												<th className="w-32 px-4 py-2 text-left font-medium">
													Unit
												</th>
												<th className="px-4 py-2 text-left font-medium">
													Category
												</th>
												<th className="px-4 py-2 text-left font-medium">
													Description
												</th>
												<th className="w-40 px-4 py-2 text-left font-medium">
													Expiry
												</th>
												<th className="w-12 px-4 py-2 text-center"></th>
											</tr>
										</thead>
										<tbody className="divide-y">
											<form.Subscribe
												selector={(state) => state.values.ingredients}
											>
												{(ingredients) => (
													<>
														{ingredients.map((_, idx) => (
															<tr key={`ing-${idx}`}>
																<td className="p-2">
																	<form.AppField
																		name={`ingredients[${idx}].name`}
																	>
																		{(field) => (
																			<Input
																				value={field.state.value}
																				onChange={(e) =>
																					field.handleChange(e.target.value)
																				}
																				placeholder="Name"
																				aria-invalid={isInvalidTouched(field)}
																				className="h-8"
																			/>
																		)}
																	</form.AppField>
																</td>
																<td className="p-2">
																	<form.AppField
																		name={`ingredients[${idx}].amount`}
																	>
																		{(field) => (
																			<Input
																				type="number"
																				value={field.state.value}
																				onChange={(e) =>
																					field.handleChange(
																						parseFloat(e.target.value) || 0,
																					)
																				}
																				aria-invalid={isInvalidTouched(field)}
																				className="h-8"
																			/>
																		)}
																	</form.AppField>
																</td>
																<td className="p-2">
																	<form.AppField
																		name={`ingredients[${idx}].unit`}
																	>
																		{(field) => (
																			<Combobox<string>
																				value={field.state.value ?? ""}
																				onChange={(value) =>
																					field.handleChange(value || "")
																				}
																				groups={ingredientUnitGroups}
																				className="h-8"
																			/>
																		)}
																	</form.AppField>
																</td>
																<td className="p-2">
																	<form.AppField
																		name={`ingredients[${idx}].category`}
																	>
																		{(field) => (
																			<Select
																				value={field.state.value}
																				onValueChange={field.handleChange}
																			>
																				<SelectTrigger className="h-8">
																					<SelectValue placeholder="Category" />
																				</SelectTrigger>
																				<SelectContent>
																					{ingredientsCategoriesOptions.map(
																						(cat) => (
																							<SelectItem
																								key={cat.value}
																								value={cat.value}
																							>
																								{cat.label}
																							</SelectItem>
																						),
																					)}
																				</SelectContent>
																			</Select>
																		)}
																	</form.AppField>
																</td>
																<td className="p-2">
																	<form.AppField
																		name={`ingredients[${idx}].description`}
																	>
																		{(field) => (
																			<Input
																				value={field.state.value ?? ""}
																				onChange={(e) =>
																					field.handleChange(e.target.value)
																				}
																				className="h-8"
																			/>
																		)}
																	</form.AppField>
																</td>
																<td className="p-2">
																	<form.AppField
																		name={`ingredients[${idx}].expiresAt`}
																	>
																		{(field) => (
																			<Input
																				autoComplete="off"
																				type="date"
																				value={field.state.value ?? ""}
																				onChange={(e) =>
																					field.handleChange(e.target.value)
																				}
																				className="h-8"
																			/>
																		)}
																	</form.AppField>
																</td>
																<td className="p-2 text-center">
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
																		onClick={() =>
																			form.removeFieldValue("ingredients", idx)
																		}
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</td>
															</tr>
														))}
													</>
												)}
											</form.Subscribe>
										</tbody>
									</table>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="w-full"
									onClick={handleAddRow}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Item
								</Button>
							</div>
						)}
					</div>

					<DialogFooter className="gap-2 sm:gap-0">
						{ingredients.length > 0 && (
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset();
								}}
							>
								Cancel
							</Button>
						)}
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={
										ingredients.length === 0 || !canSubmit || isSubmitting
									}
								>
									{isSubmitting && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Add Ingredients
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
