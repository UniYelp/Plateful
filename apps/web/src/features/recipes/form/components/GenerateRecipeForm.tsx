import { useStore } from "@tanstack/react-form";
import { Plus, Search, Sparkles, X } from "lucide-react";
import { useId, useMemo, useState } from "react";

import type { Id } from "@backend/dataModel";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppForm } from "@/lib/form";
import { commonAppliances, quickTags } from "../../constants";
import { recipeGenDefaultValues } from "../constants";
import { type RecipeGenForm, RecipeGenFormSchema } from "../schemas";
import type { IngredientDetails } from "../types";
import { SmartToggleGroup } from "./SmartToggleGroup";

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

	const tagsCheckboxId = useId();
	const ingredientsCheckboxId = useId();
	const toolsCheckboxId = useId();

	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string | null>(null);
	const [hideOutOfStock, setHideOutOfStock] = useState(false);
	const [customToolInput, setCustomToolInput] = useState("");

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
			const matchesStock =
				!hideOutOfStock || ing.availableQuantities.length > 0;
			return matchesSearch && matchesCategory && matchesStock;
		});
	}, [ingredients, search, category, hideOutOfStock]);

	// For select-all: respects the "hide out of stock" toggle, but ignores search/category filters
	const selectableIngredients = useMemo(
		() =>
			hideOutOfStock
				? ingredients.filter((ing) => ing.availableQuantities.length > 0)
				: ingredients,
		[ingredients, hideOutOfStock],
	);

	const resetFilters = () => {
		setSearch("");
		setCategory(null);
		setHideOutOfStock(false);
	};

	return (
		<form onSubmit={submitFormHandler(form)}>
			<form.AppForm>
				<div className="flex flex-col gap-8">
					<form.AppField name="tags">
						{(field) => (
							<Card aria-invalid={isInvalidTouched(field)}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Checkbox
											id={tagsCheckboxId}
											checked={
												quickTags.length > 0 &&
												quickTags.every((t) =>
													field.state.value.includes(t.value),
												)
											}
											disabled={isSubmitting || quickTags.length === 0}
											onCheckedChange={(checked) => {
												const allTagValues = quickTags.map((t) => t.value);
												if (checked) {
													field.handleChange(
														Array.from(
															new Set([...field.state.value, ...allTagValues]),
														),
													);
												} else {
													field.handleChange(
														field.state.value.filter(
															(v) => !allTagValues.includes(v),
														),
													);
												}
											}}
										/>
										<label htmlFor={tagsCheckboxId} className="cursor-pointer">
											Quick Tags
										</label>
									</CardTitle>
									<CardDescription>
										Select dietary preferences and meal characteristics
									</CardDescription>
								</CardHeader>
								<CardContent>
									<SmartToggleGroup
										items={quickTags}
										value={field.state.value}
										onValueChange={field.handleChange}
										disabled={isSubmitting}
										getValue={(tag) => tag.value}
										renderItem={(tag) => (
											<>
												<span>{tag.icon}</span> {tag.label}
											</>
										)}
										itemClassName="px-4 py-2"
									/>
								</CardContent>
							</Card>
						)}
					</form.AppField>
					<form.AppField name="ingredients">
						{(field) => (
							<Card aria-invalid={isInvalidTouched(field)}>
								<CardHeader>
									<CardTitle
										className={`flex items-center gap-2 ${isInvalidTouched(field) ? "text-red-500" : ""}`}
									>
										<Checkbox
											id={ingredientsCheckboxId}
											checked={
												selectableIngredients.length > 0 &&
												selectableIngredients.every((ing) =>
													field.state.value.includes(ing.id),
												)
											}
											disabled={
												isSubmitting || selectableIngredients.length === 0
											}
											onCheckedChange={(checked) => {
												const selectableIds = selectableIngredients.map(
													(i) => i.id,
												);
												if (checked) {
													field.handleChange(
														Array.from(
															new Set([...field.state.value, ...selectableIds]),
														),
													);
												} else {
													field.handleChange(
														field.state.value.filter(
															(v) =>
																!selectableIds.includes(v as Id<"ingredients">),
														),
													);
												}
											}}
										/>

										<label
											htmlFor={ingredientsCheckboxId}
											className="cursor-pointer"
										>
											Ingredients *
										</label>
									</CardTitle>
									<CardDescription className="flex flex-col gap-1">
										<span>Select the ingredients for the recipe.</span>
										<span className="text-muted-foreground text-xs">
											*Out-of-stock or expired ingredients can still be selected
											— they'll be used in reasonable amounts.
										</span>
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
											<div className="flex items-baseline justify-between">
												<p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
													Filter
												</p>
											</div>
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
													All Categories
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
											<button
												type="button"
												disabled={isSubmitting}
												onClick={() => {
													const next = !hideOutOfStock;
													setHideOutOfStock(next);
													if (next) {
														// Deselect any selected out-of-stock ingredients
														const outOfStockIds = new Set(
															ingredients
																.filter((ing) => ing.availableQuantities.length === 0)
																.map((ing) => ing.id),
														);
														field.handleChange(
															field.state.value.filter(
																(v) => !outOfStockIds.has(v as typeof ingredients[number]["id"]),
															),
														);
													}
												}}
												className={`flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 font-medium text-xs transition-colors ${
													hideOutOfStock
														? "border-primary bg-primary/10 text-primary"
														: "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
												}`}
											>
												<span
													className={`inline-block h-2 w-2 rounded-full transition-colors ${hideOutOfStock ? "bg-primary" : "bg-muted-foreground/40"}`}
												/>
												Exclude out of stock
											</button>
										</div>
									</div>

									{filteredIngredients.length > 0 ? (
										<SmartToggleGroup
											items={filteredIngredients}
											value={field.state.value}
											onValueChange={field.handleChange}
											disabled={isSubmitting}
											getValue={(ing) => ing.id}
											itemClassName="flex items-center gap-3 px-2 py-3"
											renderItem={(ing) => (
												<>
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
												</>
											)}
										/>
									) : (
										<div className="fade-in zoom-in-95 flex w-full animate-in flex-col items-center justify-center py-12 text-center transition-all">
											<div className="mb-4 rounded-full bg-muted p-4">
												<Search className="h-8 w-8 text-muted-foreground opacity-50" />
											</div>
											<p className="mb-1 font-semibold text-lg">
												No ingredients found
											</p>
											<p className="mb-6 max-w-xs text-muted-foreground text-sm">
												We couldn't find any ingredients matching your search or
												category filter.
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
								</CardContent>
							</Card>
						)}
					</form.AppField>
					<form.AppField name="tools">
						{(field) => (
							<Card aria-invalid={isInvalidTouched(field)}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Checkbox
											id={toolsCheckboxId}
											checked={
												commonAppliances.length > 0 &&
												commonAppliances.every((c) =>
													(field.state.value ?? []).includes(c.value),
												)
											}
											disabled={isSubmitting || commonAppliances.length === 0}
											onCheckedChange={(checked) => {
												const allToolValues = commonAppliances.map(
													(c) => c.value,
												);
												if (checked) {
													field.handleChange(
														Array.from(
															new Set([
																...(field.state.value ?? []),
																...allToolValues,
															]),
														),
													);
												} else {
													field.handleChange(
														(field.state.value ?? []).filter(
															(v) => !allToolValues.includes(v),
														),
													);
												}
											}}
										/>
										<label htmlFor={toolsCheckboxId} className="cursor-pointer">
											Available Tools
										</label>
									</CardTitle>
									<CardDescription className="flex flex-col">
										Select the tools you have available to use.
										<span className="text-muted-foreground text-xs">
											*If you don't select any, we'll assume you have basic
											kitchen tools.
										</span>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-6">
										<SmartToggleGroup
											items={[
												...commonAppliances,
												...(field.state.value
													?.filter(
														(v) => !commonAppliances.some((c) => c.value === v),
													)
													.map((v) => ({
														value: v,
														label: v,
														icon: null,
													})) ?? []),
											]}
											value={field.state.value ?? []}
											onValueChange={field.handleChange}
											disabled={isSubmitting}
											getValue={(tool) => tool.value}
											itemClassName="px-4 py-2"
											renderItem={(tool) => (
												<>
													{tool.icon && <span>{tool.icon}</span>} {tool.label}
												</>
											)}
										/>

										<div className="flex flex-col gap-2">
											<p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
												Add Custom appliances
											</p>
											<InputGroup>
												<InputGroupInput
													placeholder="e.g. Sous Vide, Pressure Cooker..."
													value={customToolInput}
													disabled={isSubmitting}
													onChange={(e) => setCustomToolInput(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															const tool = customToolInput.trim();
															if (tool && !field.state.value?.includes(tool)) {
																field.handleChange([
																	...(field.state.value ?? []),
																	tool,
																]);
																setCustomToolInput("");
															}
														}
													}}
												/>
												<InputGroupAddon align="inline-end">
													<InputGroupButton
														size="icon-xs"
														disabled={isSubmitting || !customToolInput.trim()}
														onClick={(e) => {
															e.preventDefault();
															const tool = customToolInput.trim();
															if (tool && !field.state.value?.includes(tool)) {
																field.handleChange([
																	...(field.state.value ?? []),
																	tool,
																]);
																setCustomToolInput("");
															}
														}}
													>
														<Plus className="size-3" />
													</InputGroupButton>
												</InputGroupAddon>
											</InputGroup>
										</div>
									</div>
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
