import { useAuth } from "@clerk/clerk-react";
import { usePostHog } from "@posthog/react";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";
import {
	AlertCircle,
	Camera,
	Loader2,
	Plus,
	Receipt,
	Trash2,
	X,
} from "lucide-react";
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
import { focusInvalid } from "&/forms/utils/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiClient } from "@/configs/api.config";
import { ingredientsCategoriesOptions } from "@/features/ingredients/constants";
import { useAppForm } from "@/lib/form";
import type { SelectGroup, SelectOption } from "@/types/ui/select";

const ScannedIngredientSchema = z.object({
	name: z.string().min(1, "Name is required"),
	quantities: z.array(
		z.object({
			amount: z.number().min(0.01, "Amount must be greater than 0"),
			unit: z.string().optional().nullable(),
			expiresAt: z.string().optional(),
		}),
	),
	description: z.string().optional(),
	category: z.string().min(1, "Category is required"),
});

const ReceiptScannerSchema = z.object({
	ingredients: z.array(ScannedIngredientSchema),
});

type ReceiptScannerForm = z.infer<typeof ReceiptScannerSchema>;

interface ExtractedIngredientQuantity {
	amount: number;
	unit?: string | null;
	expiresAt?: string;
}

interface ExtractedIngredient {
	name: string;
	description?: string;
	category: string;
	quantities: ExtractedIngredientQuantity[];
}

// --- Helpers ---

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
	const { getToken } = useAuth();

	const upsertIngredients = useConvexMutation(
		api.ingredients.upsertIngredients,
	);

	const posthog = usePostHog();
	const [open, setOpen] = useState(false);

	const [nonEdibleItems, setNonEdibleItems] = useState<
		(Pick<ExtractedIngredient, "name" | "description"> & {
			quantities: ExtractedIngredientQuantity[];
		})[]
	>([]);

	const [keepOriginalLanguage, setKeepOriginalLanguage] = useState(true);

	const {
		data: limits,
		isLoading,
		isError,
		refetch: refetchLimits,
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
	} = useQuery({
		queryKey: ["receipt-limits", householdId],
		queryFn: async () => {
			const { data, error } = await apiClient.receipts.limits.get({
				query: { householdId },
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				},
			});
			if (error) throw new Error("Failed to fetch limits");
			return data;
		},
		staleTime: 1000 * 60, // 1 minute cache
	});

	const isQuotaReached = limits && limits.today.total >= limits.today.max;

	const parseReceiptMutation = useMutation({
		mutationFn: async ({
			file,
			keepOriginalLanguage,
		}: {
			file: File;
			keepOriginalLanguage: boolean;
		}) => {
			posthog?.capture("receipt_scan_upload", {
				keepOriginalLanguage,
			});

			const { data, error } = await apiClient.receipts.parse.post(
				{ image: file },
				{
					query: { householdId, keepOriginalLanguage },
					headers: {
						Authorization: `Bearer ${await getToken()}`,
					},
				},
			);

			if (error) {
				throw new Error(
					typeof error.value === "string"
						? error.value
						: error.value.message || "Failed to extract ingredients",
				);
			}

			return data;
		},
		onSuccess: (data) => {
			refetchLimits();
			if (!data) return;

			const edible: ReceiptScannerForm["ingredients"] = [];
			const nonEdible: typeof nonEdibleItems = [];

			for (const ing of data.ingredients) {
				if (ing.category === "inedible") {
					// TODO: add a way to "add anyways" if the user wants to add non-edible items.
					nonEdible.push({
						name: ing.name,
						description: ing.description,
						quantities: ing.quantities,
					});
				} else {
					const rawCategory = ing.category?.toLowerCase() || "";
					const matchedCategory =
						ingredientsCategoriesOptions.find(
							(opt) =>
								opt.value === rawCategory ||
								opt.label.toLowerCase() === rawCategory ||
								opt.value.startsWith(rawCategory),
						)?.value || "other";

					edible.push({
						name: ing.name,
						description: ing.description || "",
						category: matchedCategory,
						quantities: (ing.quantities as ExtractedIngredientQuantity[]).map(
							(q) => ({
								amount: q.amount,
								unit: q.unit ? (q.unit.toLowerCase() as IngredientUnit) : null,
								expiresAt: q.expiresAt,
							}),
						),
					});
				}
			}

			setNonEdibleItems(nonEdible);
			form.setFieldValue("ingredients", edible);
		},
		onError: (err) => {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		},
	});

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

			posthog?.capture("receipt_scan_submit", {
				hasIngredients: value.ingredients.length > 0,
				hasNonEdible: nonEdibleItems.length > 0,
				keepOriginalLanguage,
			});

			try {
				const ingredientsToSubmit = value.ingredients.map((ing) => ({
					name: ing.name,
					description: ing.description,
					category: ing.category,
					quantities: ing.quantities.map((q) => ({
						amount: q.amount,
						unit: q.unit || undefined,
						expiresAt: q.expiresAt
							? new Date(q.expiresAt).getTime()
							: undefined,
					})),
				}));

				await upsertIngredients({
					householdId,
					ingredients: ingredientsToSubmit,
				});

				toast.success("Ingredients added successfully");
				setOpen(false);
				form.reset();
				setNonEdibleItems([]);
			} catch {
				toast.error("Failed to add ingredients");
			}
		},
	});

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		parseReceiptMutation.mutate({ file, keepOriginalLanguage });
	};

	const handleAddRow = () => {
		form.pushFieldValue("ingredients", {
			name: "",
			quantities: [{ amount: 1, unit: null }],
			category: "produce",
			description: "",
		});
	};

	const ingredients = useStore(form.store, (state) => state.values.ingredients);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<div className="inline-block">
					<Tooltip delayDuration={0}>
						<TooltipTrigger asChild disabled={isLoading || isError}>
							<Button
								variant="outline"
								disabled={isQuotaReached || isLoading || isError}
								className="group relative gap-2 rounded-full px-5 shadow-sm transition-all hover:shadow-md disabled:opacity-50"
							>
								<Camera className="h-4 w-4" />
								Scan Receipt
								{isQuotaReached && (
									<span className="-top-2 absolute right-[-5px] rounded-full bg-destructive px-2 py-0.5 font-bold text-[8px] text-destructive-foreground uppercase tracking-wider shadow-sm">
										Quota Reached
									</span>
								)}
							</Button>
						</TooltipTrigger>
						{isQuotaReached && (
							<TooltipContent side="top" className="max-w-xs text-center">
								<p className="font-semibold">Daily limit reached</p>
								<p className="text-xs opacity-80">
									You have used all {limits.today.max} free scans for today.
									{limits.reset && (
										<>
											<br />
											Resets at: {new Date(limits.reset).toLocaleTimeString()}
										</>
									)}
								</p>
							</TooltipContent>
						)}
					</Tooltip>
				</div>
			</DialogTrigger>
			<DialogContent className="grid max-h-[90dvh] w-full max-w-5xl grid-rows-[auto_1fr_auto] overflow-hidden p-0 sm:rounded-4xl">
				<DialogHeader className="border-b bg-muted/5 px-8 py-6">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="font-bold text-2xl tracking-tight">
								Scan Receipt
							</DialogTitle>
							<DialogDescription className="mt-1 text-muted-foreground">
								Review and edit extracted ingredients before adding them to your
								pantry.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="custom-scrollbar min-h-0 flex-0 overflow-y-auto bg-background/50">
					<form
						id="receipt-scanner-form"
						onSubmit={submitFormHandler(form)}
						className="p-8"
					>
						{ingredients.length === 0 &&
						!parseReceiptMutation.isPending &&
						!parseReceiptMutation.isError ? (
							<div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/20 py-6 text-center transition-all hover:bg-muted/30">
								<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
									<Receipt className="h-10 w-10" />
								</div>
								<h3 className="mb-2 font-bold text-2xl">Upload Receipt</h3>
								<p className="mb-6 max-w-sm text-lg text-muted-foreground">
									Snap a photo of your grocery receipt and let our AI do the
									typing for you.
								</p>
								<div className="mb-4 flex items-center gap-2">
									<Checkbox
										id="keep-original-language"
										checked={keepOriginalLanguage}
										onCheckedChange={(checked) =>
											setKeepOriginalLanguage(!!checked)
										}
										className="h-5 w-5 rounded-md border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
									/>
									<Label
										htmlFor="keep-original-language"
										className="cursor-pointer font-medium text-muted-foreground text-sm"
									>
										Keep original language
									</Label>
								</div>

								<Label
									htmlFor="receipt-upload"
									className={`cursor-pointer ${isQuotaReached ? "pointer-events-none opacity-50" : ""}`}
								>
									<div className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-10 font-bold text-lg text-primary-foreground shadow-primary/20 shadow-xl transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95">
										<Camera className="mr-2 h-5 w-5" />
										{isQuotaReached ? "Quota Reached" : "Choose Image"}
									</div>
									<input
										id="receipt-upload"
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleFileChange}
										disabled={isQuotaReached}
									/>
								</Label>
								{isQuotaReached && (
									<p className="mt-4 font-medium text-destructive text-sm">
										Daily scan limit exceeded. Please try again tomorrow.
									</p>
								)}
							</div>
						) : parseReceiptMutation.isPending ? (
							<div className="flex flex-col items-center justify-center space-y-8 py-16">
								<div className="relative">
									<div className="h-32 w-32 rounded-full border-4 border-primary/10" />
									<div className="absolute inset-0 flex items-center justify-center">
										<Loader2 className="h-16 w-16 animate-spin text-primary" />
									</div>
								</div>
								<div className="text-center">
									<h3 className="mb-2 font-bold text-2xl">Analyzing...</h3>
									<p className="text-lg text-muted-foreground">
										Extracting items and quantities from your receipt.
									</p>
								</div>
							</div>
						) : parseReceiptMutation.isError ? (
							<div className="flex flex-col items-center rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center">
								<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
									<AlertCircle className="h-10 w-10" />
								</div>
								<h3 className="mb-2 font-bold text-destructive text-xl">
									Extraction Failed
								</h3>
								<p className="mb-8 max-w-md text-destructive/80 text-lg">
									{parseReceiptMutation.error instanceof Error
										? parseReceiptMutation.error.message
										: "We couldn't process this receipt. Please try again or a different photo."}
								</p>
								<Button
									variant="outline"
									onClick={() => parseReceiptMutation.reset()}
									className="h-12 rounded-full border-destructive px-8 text-destructive hover:bg-destructive/10"
								>
									Try Again
								</Button>
							</div>
						) : (
							<div className="space-y-8">
								<div className="space-y-3">
									<form.Subscribe
										selector={(state) => state.values.ingredients}
									>
										{(ingredients) => (
											<div className="divide-y divide-border/50 rounded-2xl border bg-card/30">
												{ingredients.map((_, idx) => (
													<div
														key={`ing-${idx}`}
														className="group relative p-4 transition-colors hover:bg-muted/30"
													>
														<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:grid-cols-[auto_1fr_1fr_180px_auto] md:items-start md:gap-4">
															{/* Index Number */}
															<div className="col-start-1 row-start-1 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/50 font-bold text-[10px] text-muted-foreground md:col-start-auto md:row-start-auto">
																{idx + 1}
															</div>

															{/* Ingredient Name */}
															<div className="col-start-2 row-start-1 md:col-start-auto md:row-start-auto">
																<form.AppField
																	name={`ingredients[${idx}].name`}
																>
																	{(field) => (
																		<Input
																			value={field.state.value}
																			onChange={(e) =>
																				field.handleChange(e.target.value)
																			}
																			placeholder="Ingredient Name"
																			className="h-9 bg-background font-semibold text-base shadow-sm focus-visible:ring-1"
																		/>
																	)}
																</form.AppField>
															</div>

															{/* Notes/Description */}
															<div className="col-span-2 col-start-2 row-start-2 md:col-span-1 md:col-start-auto md:row-start-auto">
																<form.AppField
																	name={`ingredients[${idx}].description`}
																>
																	{(field) => (
																		<Input
																			value={field.state.value ?? ""}
																			onChange={(e) =>
																				field.handleChange(e.target.value)
																			}
																			placeholder="Notes/Description"
																			className="h-9 bg-muted/20 px-3 text-muted-foreground text-xs italic shadow-sm focus-visible:ring-1"
																		/>
																	)}
																</form.AppField>
															</div>

															{/* Category Select */}
															<div className="col-span-2 col-start-2 row-start-3 w-full md:col-span-1 md:col-start-auto md:row-start-auto md:w-[180px]">
																<form.AppField
																	name={`ingredients[${idx}].category`}
																>
																	{(field) => (
																		<Select
																			value={field.state.value}
																			onValueChange={field.handleChange}
																		>
																			<SelectTrigger className="h-9 w-full bg-background text-xs shadow-sm">
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
															</div>

															{/* Delete Button */}
															<Button
																type="button"
																variant="ghost"
																size="icon"
																onClick={() =>
																	form.removeFieldValue("ingredients", idx)
																}
																className="col-start-3 row-start-1 h-9 w-9 justify-self-end text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive md:col-start-auto md:row-start-auto md:justify-self-auto"
															>
																<Trash2 className="h-4 w-4" />
															</Button>

															<div className="col-span-2 col-start-2 row-start-4 mt-3 space-y-4 md:col-span-3 md:col-start-2 md:row-start-auto md:space-y-2">
																<form.Subscribe
																	selector={(state) =>
																		state.values.ingredients[idx].quantities
																	}
																>
																	{(quantities) => (
																		<>
																			{quantities.map((_, qIdx) => (
																				<div
																					key={`q-${qIdx}`}
																					className="grid grid-cols-[80px_1fr_32px] items-center gap-2 border-border/30 border-b pb-3 last:border-0 last:pb-0 md:grid-cols-[90px_1fr_160px_32px] md:gap-2 md:border-0 md:pb-0"
																				>
																					<form.AppField
																						name={`ingredients[${idx}].quantities[${qIdx}].amount`}
																					>
																						{(field) => (
																							<Input
																								type="number"
																								value={field.state.value}
																								onChange={(e) =>
																									field.handleChange(
																										parseFloat(
																											e.target.value,
																										) || 0,
																									)
																								}
																								placeholder="Qty"
																								className="col-start-1 row-start-1 h-8 bg-background px-2 text-sm shadow-sm focus-visible:ring-1 md:col-start-auto md:row-start-auto"
																							/>
																						)}
																					</form.AppField>
																					<form.AppField
																						name={`ingredients[${idx}].quantities[${qIdx}].unit`}
																					>
																						{(field) => (
																							<Combobox<string>
																								value={field.state.value ?? ""}
																								onChange={(value) =>
																									field.handleChange(
																										value || null,
																									)
																								}
																								groups={ingredientUnitGroups}
																								placeholder="None"
																								className="col-start-2 row-start-1 h-8 bg-background text-xs shadow-sm focus-visible:ring-1 md:col-start-auto md:row-start-auto"
																							/>
																						)}
																					</form.AppField>
																					<form.AppField
																						name={`ingredients[${idx}].quantities[${qIdx}].expiresAt`}
																					>
																						{(field) => (
																							<div className="col-span-2 col-start-1 row-start-2 flex items-center gap-2 rounded-md border bg-background px-2 md:col-span-1 md:col-start-auto md:row-start-auto">
																								<span className="text-[10px] text-muted-foreground uppercase">
																									Exp:
																								</span>
																								<Input
																									type="date"
																									value={
																										field.state.value ?? ""
																									}
																									onChange={(e) =>
																										field.handleChange(
																											e.target.value,
																										)
																									}
																									className="h-8 w-full border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
																								/>
																							</div>
																						)}
																					</form.AppField>
																					<Button
																						type="button"
																						variant="ghost"
																						size="icon"
																						onClick={() =>
																							form.removeFieldValue(
																								`ingredients[${idx}].quantities`,
																								qIdx,
																							)
																						}
																						disabled={quantities.length === 1}
																						className="col-start-3 row-start-1 h-7 w-7 justify-self-end text-muted-foreground hover:text-destructive disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground md:col-start-auto md:row-start-auto md:justify-self-auto"
																					>
																						<X className="h-3.5 w-3.5" />
																					</Button>
																				</div>
																			))}
																		</>
																	)}
																</form.Subscribe>

																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	className="h-7 px-0 text-primary text-xs hover:bg-transparent hover:text-primary-hover hover:underline"
																	onClick={() =>
																		form.pushFieldValue(
																			`ingredients[${idx}].quantities`,
																			{
																				amount: 1,
																				unit: null,
																			},
																		)
																	}
																>
																	<Plus className="mr-1 h-3 w-3" />
																	Add Batch
																</Button>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</form.Subscribe>
								</div>

								<Button
									type="button"
									variant="outline"
									className="h-12 w-full rounded-2xl border-dashed bg-muted/10 transition-all hover:bg-muted/20 hover:text-foreground hover:shadow-sm"
									onClick={handleAddRow}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Ingredient Manually
								</Button>

								{nonEdibleItems.length > 0 && (
									<div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6">
										<div className="mb-3 flex items-center gap-2 text-amber-600">
											<AlertCircle className="h-4 w-4" />
											<h4 className="font-bold text-xs uppercase tracking-widest">
												Non-Edible Items
											</h4>
										</div>
										<div className="flex flex-wrap gap-2">
											{nonEdibleItems.map((item, idx) => (
												<Badge
													key={`non-edible-${idx}`}
													variant="secondary"
													className="border-none bg-amber-100/50 px-2 py-0.5 text-amber-700 text-xs"
												>
													{item.name}
												</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</form>
				</div>

				<div className="border-t bg-muted/5 p-6">
					<DialogFooter className="flex flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							{ingredients.length > 0 && (
								<Button
									type="button"
									variant="ghost"
									onClick={() => {
										form.reset();
										setNonEdibleItems([]);
										parseReceiptMutation.reset();
									}}
									className="text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
								>
									Discard All
								</Button>
							)}
						</div>
						<div className="flex items-center gap-3">
							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
							>
								{([canSubmit, isSubmitting]) => (
									<Button
										type="submit"
										form="receipt-scanner-form"
										disabled={
											ingredients.length === 0 || !canSubmit || isSubmitting
										}
										className="h-12 rounded-full px-10 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
									>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-5 w-5 animate-spin" />
												Saving...
											</>
										) : (
											`Save ${ingredients.length} Item${ingredients.length !== 1 ? "s" : ""} to Pantry`
										)}
									</Button>
								)}
							</form.Subscribe>
						</div>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
