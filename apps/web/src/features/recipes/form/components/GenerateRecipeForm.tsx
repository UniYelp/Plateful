import { useStore } from "@tanstack/react-form";
import { Sparkles } from "lucide-react";

import { submitFormHandler } from "&/forms/utils/submission";
import { focusInvalid, isInvalidTouched } from "&/forms/utils/validation";
import { ingredientImgByCategory } from "&/ingredients/constants";
import { ingredientSymbolToDisplay } from "&/ingredients/utils/ingredient-symbol-to-display";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppForm } from "@/lib/form";
import { quickTags } from "../../constants";
import { recipeGenDefaultValues } from "../constants";
import { type RecipeGenForm, RecipeGenFormSchema } from "../schemas";
import type { IngredientDetails } from "../types";

type Props = {
	ingredients: IngredientDetails[];
	onSubmit: (value: RecipeGenForm) => Promise<void>;
};
export const GenerateRecipeForm = (props: Props) => {
	const { ingredients, onSubmit } = props;

	const form = useAppForm({
		defaultValues: recipeGenDefaultValues,
		validators: {
			onChange: RecipeGenFormSchema,
		},
		onSubmitInvalid: focusInvalid,
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<form onSubmit={submitFormHandler(form)}>
			<form.AppForm>
				<div className="flex flex-col gap-8">
					<form.AppField name="tags">
						{(field) => (
							<Card>
								<CardHeader>
									<CardTitle>Quick Tags</CardTitle>
									<CardDescription>
										Select dietary preferences and meal characteristics
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ToggleGroup
										type="multiple"
										variant="outline"
										disabled={isSubmitting}
										onValueChange={field.handleChange}
										aria-invalid={isInvalidTouched(field)}
										className="flex flex-wrap gap-2.5"
									>
										{quickTags.map((tag) => (
											<ToggleGroupItem
												key={tag.value}
												value={tag.value}
												aria-label={`Toggle ${tag.value}`}
												className="rounded-lg border-2 px-4 py-2 font-medium text-sm transition-all duration-200 data-[state=on]:scale-105 data-[state=off]:border-border data-[state=on]:border-primary data-[state=off]:bg-background data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:shadow-sm data-[state=off]:hover:border-primary/50 data-[state=off]:hover:bg-muted data-[state=off]:hover:text-black"
											>
												<span>{tag.icon}</span> {tag.label}
											</ToggleGroupItem>
										))}
									</ToggleGroup>
								</CardContent>
							</Card>
						)}
					</form.AppField>
					<form.AppField name="ingredients">
						{(field) => (
							<Card>
								<CardHeader>
									<CardTitle
										className={`${isInvalidTouched(field) ? "text-red-500" : ""}`}
									>
										Ingredients *
									</CardTitle>
									<CardDescription>
										Select the ingredients for the recipe
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ToggleGroup
										type="multiple"
										variant="outline"
										disabled={isSubmitting}
										onValueChange={field.handleChange}
										aria-invalid={isInvalidTouched(field)}
										className="flex flex-wrap gap-2.5"
									>
										{ingredients?.map((ing) => (
											<ToggleGroupItem
												key={ing.id}
												value={ing.id}
												disabled={isSubmitting}
												aria-label={`Toggle ${ing.name}`}
												className="flex items-center gap-3 rounded-lg border-2 px-2 py-3 font-medium text-sm transition-all duration-200 data-[state=on]:scale-105 data-[state=off]:border-border data-[state=on]:border-primary data-[state=off]:bg-background data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:shadow-sm data-[state=off]:hover:border-primary/50 data-[state=off]:hover:bg-muted data-[state=off]:hover:text-black"
											>
												<img
													src={
														ingredientImgByCategory[
															ing.category as keyof typeof ingredientImgByCategory
														]
													}
													alt={ing.name}
													className="h-10 w-10 rounded-lg object-cover"
												/>
												<div className="flex flex-col items-start justify-start">
													<p className="font-medium text-sm">{ing.name}</p>
													<p className="text-muted-foreground text-xs">
														{ing.availableQuantities.length ? (
															<>
																Available:{" "}
																<span>
																	{ing.availableQuantities
																		.map((quantity) =>
																			`${quantity.amount} ${ingredientSymbolToDisplay(
																				quantity.unit ?? "",
																			)} ${
																				quantity.state
																					? ` (${quantity.state})`
																					: ""
																			}`.trim(),
																		)
																		.join(", ")}
																</span>
															</>
														) : (
															"Unlimited"
														)}
													</p>
												</div>
											</ToggleGroupItem>
										))}
									</ToggleGroup>
								</CardContent>
							</Card>
						)}
					</form.AppField>
					<Card>
						<CardContent className="p-8 text-center">
							<Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
							<form.SubmitButton>
								<Sparkles className="mr-2 h-4 w-4" />
								Generate Recipe
							</form.SubmitButton>
						</CardContent>
					</Card>
				</div>
			</form.AppForm>
		</form>
	);
};
