import { useStore } from "@tanstack/react-form";
import { Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import { submitFormHandler } from "&/forms/utils/submission";
import { focusInvalid, isInvalidTouched } from "&/forms/utils/validation";
import {
	ingredientImgByCategory,
	ingredientsCategoriesOptions,
} from "&/ingredients/constants";
import { ingredientSymbolToDisplay } from "&/ingredients/utils/ingredient-symbol-to-display";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
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

	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string | null>(null);

	const categories = useMemo(() => {
		if (!ingredients) return [];
		const cats = new Set(ingredients.map((i) => i.category));
		return Array.from(cats)
			.sort()
			.map((cat) => ({
				value: cat,
				label:
					ingredientsCategoriesOptions.find((opt) => opt.value === cat)
						?.label ?? cat.charAt(0).toUpperCase() + cat.slice(1),
			}));
	}, [ingredients]);

	const filteredIngredients = useMemo(() => {
		if (!ingredients) return [];
		return ingredients.filter((ing) => {
			const matchesSearch = ing.name
				.toLowerCase()
				.includes(search.toLowerCase());
			const matchesCategory = !category || ing.category === category;
			return matchesSearch && matchesCategory;
		});
	}, [ingredients, search, category]);

	const resetFilters = () => {
		setSearch("");
		setCategory(null);
	};

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
									<div className="mb-6 flex flex-col gap-4">
										<InputGroup>
											<InputGroupAddon>
												<Search className="size-4 text-muted-foreground" />
											</InputGroupAddon>
											<InputGroupInput
												placeholder="Search ingredients..."
												value={search}
												disabled={isSubmitting}
												onChange={(e) => setSearch(e.target.value)}
											/>
											{search && (
												<InputGroupAddon align="inline-end">
													<InputGroupButton
														size="icon-xs"
														disabled={isSubmitting}
														onClick={() => setSearch("")}
													>
														<X className="size-3" />
													</InputGroupButton>
												</InputGroupAddon>
											)}
										</InputGroup>

										<div className="flex flex-col gap-2">
											<p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
												Categories
											</p>
											<ToggleGroup
												type="single"
												variant="outline"
												value={category ?? ""}
												disabled={isSubmitting}
												onValueChange={(val) => setCategory(val || null)}
												className="flex flex-wrap justify-start gap-2"
											>
												<ToggleGroupItem
													value=""
													className="rounded-full px-4 py-1.5 text-xs transition-all data-[state=on]:bg-primary data-[state=on]:text-white"
												>
													All
												</ToggleGroupItem>
												{categories.map((cat) => (
													<ToggleGroupItem
														key={cat.value}
														value={cat.value}
														className="rounded-full px-4 py-1.5 text-xs transition-all data-[state=on]:bg-primary data-[state=on]:text-white"
													>
														{cat.label}
													</ToggleGroupItem>
												))}
											</ToggleGroup>
										</div>
									</div>

									<ToggleGroup
										type="multiple"
										variant="outline"
										disabled={isSubmitting}
										onValueChange={field.handleChange}
										aria-invalid={isInvalidTouched(field)}
										className="flex flex-wrap gap-2.5"
									>
										{filteredIngredients.length > 0 ? (
											filteredIngredients.map((ing) => (
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
																				)}`.trim(),
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
											))
										) : (
											<div className="fade-in zoom-in-95 flex w-full animate-in flex-col items-center justify-center py-12 text-center transition-all">
												<div className="mb-4 rounded-full bg-muted p-4">
													<Search className="h-8 w-8 text-muted-foreground opacity-50" />
												</div>
												<p className="mb-1 font-semibold text-lg">
													No ingredients found
												</p>
												<p className="mb-6 max-w-xs text-muted-foreground text-sm">
													We couldn't find any ingredients matching your search
													or category filter.
												</p>
												{(search || category) && (
													<Button
														variant="outline"
														size="sm"
														onClick={resetFilters}
														className="rounded-full"
													>
														<X className="mr-2 h-4 w-4" />
														Clear all filters
													</Button>
												)}
											</div>
										)}
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
