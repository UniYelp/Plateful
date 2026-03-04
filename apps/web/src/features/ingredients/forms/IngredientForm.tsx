import { Link } from "@tanstack/react-router";
import { useConvex } from "convex/react";
import { AlertCircle } from "lucide-react";

import {
	IngredientSymbol,
	type IngredientUnit,
	ingredientUnitsByCategory,
} from "@plateful/ingredients";
import { entriesOf } from "@plateful/utils";
import { api } from "@backend/api";
import type { Id } from "@backend/dataModel";
import { ConflictError } from "&/errors/models/conflict";
import { handleError } from "&/errors/utils/handle-error";
import { submitFormHandler } from "&/forms/utils/submission";
import { focusInvalid, isInvalidTouched } from "&/forms/utils/validation";
import { ingredientsCategoriesOptions } from "&/ingredients/constants";
import {
	addIngredientFormDefaultValues,
	INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH,
	INGREDIENT_MINIMUM_NAME_LENGTH,
} from "&/ingredients/forms/constants";
import {
	type IngredientFormInput,
	type IngredientFormOutput,
	IngredientFormSchema,
} from "&/ingredients/forms/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { useAppForm } from "@/lib/form";
import type { SelectGroup, SelectOption } from "@/types/ui/select";

type Props = {
	householdId: Id<"households">;
	defaultValues?: Partial<IngredientFormInput>;
	submitAction: string;
	onSubmit: (value: IngredientFormOutput) => Promise<void>;
};

const NameConflict = "An ingredient with this name already exists";

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

export function IngredientForm({
	householdId,
	defaultValues,
	submitAction,
	onSubmit,
}: Props) {
	const form = useAppForm({
		defaultValues: {
			...addIngredientFormDefaultValues,
			...defaultValues,
		} satisfies IngredientFormInput,
		validators: {
			onChange: IngredientFormSchema,
		},
		onSubmitInvalid: focusInvalid,
		onSubmit: async ({ value, formApi }) => {
			try {
				return await onSubmit(value);
			} catch (err) {
				const error = handleError(err);

				if (error instanceof ConflictError) {
					formApi.fieldInfo.name.instance?.setErrorMap?.({
						onServer: NameConflict,
					});
				}
			}
		},
	});

	const convexClient = useConvex();

	return (
		<form onSubmit={submitFormHandler(form)} className="space-y-6">
			<form.Subscribe selector={(state) => [state.fieldMeta.name?.errors]}>
				{([nameFieldErrors]) =>
					nameFieldErrors?.some((error) => error === NameConflict) && (
						<Card className="mb-6 border-amber-200 bg-amber-50 py-2">
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
									<div>
										<h4 className="font-medium text-amber-800">
											Similar ingredient found
										</h4>
										<p className="mt-1 text-amber-700 text-sm">
											We found similar ingredients in your inventory. Please
											choose another name for your ingredient to avoid
											duplicates.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				}
			</form.Subscribe>

			<form.AppForm>
				<div className="flex gap-6">
					<div className="flex-1 space-y-4">
						<form.AppField
							name="name"
							validators={{
								onChangeAsyncDebounceMs: 800,
								onChangeAsync: async (field) => {
									const name = field.value?.trim();

									const isDefaultValue =
										field.fieldApi.state.meta.isDefaultValue;

									if (
										isDefaultValue ||
										!name ||
										name.length < INGREDIENT_MINIMUM_NAME_LENGTH
									) {
										return;
									}

									const similarIngredient = await convexClient.query(
										api.ingredients.uniqueByName,
										{
											name,
											householdId,
										},
									);
									if (!similarIngredient) {
										return;
									}

									return NameConflict;
								},
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="name">Name *</Label>
									<Input
										placeholder="e.g., Fresh Basil"
										value={field.state.value ?? ""}
										aria-invalid={isInvalidTouched(field)}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<field.FieldError />
								</div>
							)}
						</form.AppField>
						<form.AppField name="description">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<TextArea
										className="field-sizing-fixed"
										placeholder="e.g., Organic fresh basil leaves from local farm"
										rows={5}
										maxLength={INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH}
										value={field.state.value ?? ""}
										aria-invalid={isInvalidTouched(field)}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<field.FieldError />
								</div>
							)}
						</form.AppField>
					</div>
					<div className="flex-1 space-y-4">
						<form.AppField name="category">
							{(field) => (
								<div className="space-y-2 pb-2">
									<Label htmlFor="category">Category *</Label>
									<Select
										value={field.state.value ?? ""}
										aria-invalid={isInvalidTouched(field)}
										onValueChange={(value) => field.handleChange(value)}
									>
										<SelectTrigger
											aria-invalid={isInvalidTouched(field)}
											className={
												isInvalidTouched(field) ? "border-destructive" : ""
											}
										>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{ingredientsCategoriesOptions.map((category) => (
												<SelectItem key={category.value} value={category.value}>
													{category.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<field.FieldError />
								</div>
							)}
						</form.AppField>
						<form.Subscribe selector={(state) => state.values.quantities}>
							{(quantities) => (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<Label className="text-base font-semibold">Quantities</Label>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												form.pushFieldValue("quantities", { amount: NaN })
											}
										>
											Add Quantity
										</Button>
									</div>

									{quantities?.map((_, index) => (
										<div
											key={`quantity-${index}`}
											className="relative rounded-lg border p-4 shadow-sm"
										>
											{quantities.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
													onClick={() =>
														form.removeFieldValue("quantities", index)
													}
												>
													<span className="sr-only">Remove</span>
													&times;
												</Button>
											)}

											<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
												<form.AppField
													name={`quantities[${index}].amount`}
												>
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={`amount-${index}`}>Amount *</Label>
															<Input
																id={`amount-${index}`}
																type="number"
																placeholder="e.g., 50, 1, 0.5"
																value={
																	Number.isFinite(field.state.value)
																		? field.state.value
																		: ""
																}
																aria-invalid={isInvalidTouched(field)}
																onChange={(e) =>
																	field.handleChange(e.target.valueAsNumber)
																}
															/>
															<field.FieldError />
														</div>
													)}
												</form.AppField>
												<form.AppField
													name={`quantities[${index}].unit`}
												>
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={`unit-${index}`}>Unit</Label>
															<Combobox<string>
																value={field.state.value ?? ""}
																onChange={(value) =>
																	field.handleChange(value || undefined)
																}
																groups={ingredientUnitGroups}
															/>
															<field.FieldError />
														</div>
													)}
												</form.AppField>
											</div>
											<div className="mt-4">
												<form.AppField
													name={`quantities[${index}].expiryDate`}
												>
													{(field) => (
														<div className="space-y-2">
															<Label htmlFor={`expiryDate-${index}`}>
																Expiry Date
															</Label>
															<Input
																id={`expiryDate-${index}`}
																type="date"
																value={field.state.value ?? ""}
																aria-invalid={isInvalidTouched(field)}
																onChange={(e) =>
																	field.handleChange(e.target.value || undefined)
																}
															/>
															<field.FieldError />
														</div>
													)}
												</form.AppField>
											</div>
										</div>
									))}
								</div>
							)}
						</form.Subscribe>

						
					</div>
				</div>

				{/* Submit Buttons */}
				<div className="flex justify-end gap-3 pt-4">
					<form.SubmitButton>{submitAction} Ingredient</form.SubmitButton>
					<Button type="button" variant="outline" asChild>
						<Link to="/dashboard/ingredients">Cancel</Link>
					</Button>
				</div>
			</form.AppForm>
		</form>
	);
}
