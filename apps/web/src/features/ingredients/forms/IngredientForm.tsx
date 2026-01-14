import { Link } from "@tanstack/react-router";

import { IngredientSymbol, ingredientUnits } from "@plateful/ingredients";
import { submitFormHandler } from "&/forms/utils/submission";
import { focusInvalid, isInvalidTouched } from "&/forms/utils/validation";
import { ingredientsCategoriesOptions } from "&/ingredients/constants";
import {
	addIngredientFormDefaultValues,
	INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH,
} from "&/ingredients/forms/constants";
import {
	type IngredientFormInput,
	type IngredientFormOutput,
	IngredientFormSchema,
} from "&/ingredients/forms/schemas";
import { Button } from "@/components/ui/button";
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

type Props = {
	defaultValues?: Partial<IngredientFormInput>;
	onSubmit: (value: IngredientFormOutput) => Promise<void>;
};

export function IngredientForm({ defaultValues, onSubmit }: Props) {
	const form = useAppForm({
		defaultValues: {
			...addIngredientFormDefaultValues,
			...defaultValues,
		} satisfies IngredientFormInput,
		validators: {
			onChange: IngredientFormSchema,
		},
		onSubmitInvalid: focusInvalid,
		onSubmit: async ({ value }) => await onSubmit(value),
	});

	// const [showSimilarWarning, setShowSimilarWarning] = useState(true);

	return (
		<form onSubmit={submitFormHandler(form)} className="space-y-6">
			{/* {showSimilarWarning && (
				<Card className="mb-6 border-amber-200 bg-amber-50">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
							<div>
								<h4 className="font-medium text-amber-800">
									Similar ingredient found
								</h4>
								<p className="mt-1 text-amber-700 text-sm">
									We found similar ingredients in your inventory. Would you like
									to update the existing amount instead?
								</p>
								<div className="mt-3 flex gap-2">
									<Button
										size="sm"
										variant="outline"
										className="border-amber-300 bg-transparent text-amber-700"
									>
										Update Existing
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setShowSimilarWarning(false)}
									>
										Add New
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)} */}
			<form.AppForm>
				<form.AppField
					name="name"
					validators={{
						onChangeAsyncDebounceMs: 800,
						onChangeAsync: async (field) => {
							// TODO create similar ingredient warning
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
								placeholder="e.g., Organic fresh basil leaves from local farm"
								rows={3}
								maxLength={INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH}
								value={field.state.value ?? ""}
								aria-invalid={isInvalidTouched(field)}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<field.FieldError />
						</div>
					)}
				</form.AppField>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<form.AppField name="amount">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="amount">Amount *</Label>
								<Input
									type="number"
									placeholder="e.g., 50, 1, 0.5"
									value={
										Number.isFinite(field.state.value) ? field.state.value : ""
									}
									aria-invalid={isInvalidTouched(field)}
									onChange={(e) => field.handleChange(e.target.valueAsNumber)}
								/>
								<field.FieldError />
							</div>
						)}
					</form.AppField>
					<form.AppField name="unit">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="unit">Unit</Label>
								<Combobox
									value={field.state.value ?? ""}
									onChange={(value) => field.handleChange(value || undefined)}
									options={ingredientUnits.map((unit) => {
										const symbol = IngredientSymbol[unit];
										return {
											value: unit as string,
											label:
												`${unit} ${symbol !== unit ? `(${symbol})` : ""}`.trim(),
										};
									})}
								/>

								<field.FieldError />
							</div>
						)}
					</form.AppField>

					<form.AppField name="category">
						{(field) => (
							<div className="space-y-2">
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
				</div>
				<form.AppField name="expiryDate">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="expiryDate">Expiry Date</Label>
							<Input
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

				{/* Submit Buttons */}
				<div className="flex gap-3 pt-4">
					<form.SubmitButton className="flex-1">
						{form.state.isSubmitting ? "Adding..." : "Add Ingredient"}
					</form.SubmitButton>
					<Button type="button" variant="outline" asChild>
						<Link to="/dashboard/ingredients">Cancel</Link>
					</Button>
				</div>
			</form.AppForm>
		</form>
	);
}
