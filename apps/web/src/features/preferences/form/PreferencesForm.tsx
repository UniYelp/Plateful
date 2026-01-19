import {
	ArrowLeft,
	ArrowRight,
	Check,
	ChefHat,
	Plus,
	Sparkles,
	X,
} from "lucide-react";
import { useState } from "react";

import type { Maybe } from "@plateful/types";
import { submitFormHandler } from "&/forms/utils/submission";
import { focusInvalid } from "&/forms/utils/validation";
import {
	COMMON_ALLERGENS,
	DIETARY_OPTIONS,
	preferenceDefaultValues,
	QUICK_FEATURES,
	SPICE_LEVELS,
} from "&/preferences/form/constants";
import {
	type PreferencesFormInput,
	type PreferencesFormOutput,
	PreferencesFormSchema,
} from "&/preferences/form/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TextArea } from "@/components/ui/textarea";
import { APP } from "@/configs/app.config";
import { useAppForm } from "@/lib/form";

// TODO: handle array values in lowercase to avoid duplicates
// TODO: fix pages sizes
// TODO: add all inputs to the summary
// TODO: add "skip" button to the entire process

type PreferencesFormProps = {
	defaultValues?: Maybe<Partial<PreferencesFormInput>>;
	onSubmit: (value: PreferencesFormOutput) => Promise<void>;
};
export function PreferencesForm({
	defaultValues,
	onSubmit,
}: PreferencesFormProps) {
	const [step, setStep] = useState(1);
	const totalSteps = 5;

	const form = useAppForm({
		defaultValues: {
			...preferenceDefaultValues,
			...defaultValues,
		},
		validators: {
			onChange: PreferencesFormSchema,
		},
		onSubmitInvalid: focusInvalid,
		onSubmit: ({ value }) => onSubmit(value),
	});

	const [customAllergen, setCustomAllergen] = useState("");
	const [customDietary, setCustomDietary] = useState("");

	const progressValue = ((step - 1) / (totalSteps - 1)) * 100;

	return (
		<form onSubmit={submitFormHandler(form)}>
			<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary/5 via-background to-primary/10 p-4">
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-primary/10 blur-3xl"></div>
					<div className="absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl delay-1000"></div>
					<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-125 w-125 animate-spin-slow rounded-full bg-linear-to-r from-primary/5 to-transparent blur-3xl"></div>
				</div>

				<Card className="relative z-10 w-full max-w-3xl border-2 shadow-2xl">
					<CardHeader className="space-y-2 pb-2 text-center">
						{step === 1 ? (
							<>
								<div className="relative mb-4 flex justify-center">
									<div className="absolute inset-0 animate-pulse rounded-3xl bg-primary/20 blur-xl"></div>
									<div className="relative flex h-20 w-20 transform items-center justify-center rounded-3xl bg-linear-to-br from-primary to-primary/70 shadow-2xl transition-transform duration-300 hover:scale-110">
										<ChefHat className="h-12 w-12 animate-bounce-subtle text-primary-foreground" />
									</div>
								</div>
								<div className="space-y-1">
									<CardTitle className="bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text font-bold text-4xl text-transparent">
										Welcome to {APP.name}!
									</CardTitle>
									<CardDescription className="flex items-center justify-center gap-2 text-lg">
										<Sparkles className="h-4 w-4 text-primary" />
										Let's personalize your cooking experience
										<Sparkles className="h-4 w-4 text-primary" />
									</CardDescription>
								</div>
							</>
						) : (
							<div>
								<div className="mb-3 flex justify-between px-1 font-medium text-muted-foreground text-sm">
									<span className="flex items-center gap-2">
										Step <span className="text-lg text-primary">{step}</span> of{" "}
										{totalSteps}
									</span>
									<span className="font-semibold text-lg text-primary">
										{Math.round(progressValue)}%
									</span>
								</div>
								<Progress value={progressValue} className="h-3 shadow-inner" />
							</div>
						)}
					</CardHeader>

					<CardContent className="space-y-6 pb-8">
						<form.AppForm>
							{/* Step 1: Welcome */}
							{step === 1 && (
								<div className="fade-in slide-in-from-bottom-8 animate-in space-y-6 duration-700">
									<div className="space-y-4 py-4 text-center">
										<div className="space-y-3">
											<p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
												We'll help you discover amazing recipes tailored to your
												tastes, dietary needs, and cooking style. This will only
												take a minute!
											</p>
										</div>
										<div className="grid grid-cols-3 gap-6 pt-8">
											{QUICK_FEATURES.map((feature) => (
												<div
													key={feature.title}
													className="flex flex-col items-center gap-3 rounded-2xl border-2 border-primary/20 bg-linear-to-br from-primary/10 to-primary/5 p-6 shadow-lg transition-transform duration-300 hover:scale-105"
												>
													<div className="animate-bounce-subtle text-5xl">
														{feature.icon}
													</div>
													<p className="text-center font-semibold text-sm">
														{feature.title}
													</p>
													<p className="text-center text-muted-foreground text-xs">
														{feature.description}
													</p>
												</div>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Step 2: Allergens */}
							{step === 2 && (
								<div className="fade-in slide-in-from-bottom-8 animate-in space-y-6 duration-700">
									<div className="space-y-2 text-center">
										<h2 className="font-bold text-2xl">
											Do you have any food allergens?
										</h2>
										<p className="text-muted-foreground">
											Select common allergens or add your own. We'll keep you
											safe.
										</p>
									</div>
									<form.AppField name="allergens" mode="array">
										{(form) => (
											<>
												<div>
													<Label className="mb-3 block font-semibold text-muted-foreground text-sm">
														COMMON ALLERGENS
													</Label>
													<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
														{COMMON_ALLERGENS.map((allergen) => (
															<button
																type="button"
																key={allergen}
																onClick={() => {
																	if (form.state.value.includes(allergen)) {
																		const index =
																			form.state.value.indexOf(allergen);
																		form.removeValue(index);
																	} else {
																		form.pushValue(allergen);
																	}
																}}
																className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300 ${
																	form.state.value.includes(allergen)
																		? "scale-105 border-primary bg-linear-to-br from-primary/10 to-primary/5 shadow-lg"
																		: "border-border hover:border-primary/50 hover:shadow-md"
																}`}
															>
																<div className="relative z-10 flex items-center justify-between">
																	<span className="font-medium capitalize">
																		{allergen}
																	</span>
																	{form.state.value.includes(allergen) && (
																		<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
																			<Check className="h-4 w-4 text-primary-foreground" />
																		</div>
																	)}
																</div>
																<div className="absolute inset-0 translate-y-full bg-primary/5 transition-transform duration-300 group-hover:translate-y-0"></div>
															</button>
														))}
													</div>
												</div>

												<div className="space-y-3">
													<Label className="block font-semibold text-muted-foreground text-sm">
														ADD CUSTOM ALLERGEN
													</Label>
													<div className="flex gap-2">
														<Input
															type="text"
															placeholder="e.g., Mustard, Celery, Lupin..."
															value={customAllergen}
															maxLength={25}
															onChange={(e) =>
																setCustomAllergen(e.target.value)
															}
															onKeyDown={(e) => {
																if (e.key === "Enter") {
																	e.preventDefault();
																	const value = customAllergen.trim();
																	if (!value) return;
																	form.pushValue(value);
																	setCustomAllergen("");
																}
															}}
															className="h-11 flex-1"
														/>
														<Button
															type="button"
															onClick={() => {
																const value = customAllergen.trim();
																if (!value) return;
																form.pushValue(value);
																setCustomAllergen("");
															}}
															disabled={!customAllergen.trim()}
															className="h-11 px-6"
														>
															<Plus className="mr-2 h-4 w-4" />
															Add
														</Button>
													</div>
												</div>

												{form.state.value.length > 0 && (
													<div className="rounded-xl border-2 border-destructive/20 bg-linear-to-br from-destructive/5 to-destructive/10 p-5">
														<p className="mb-3 flex items-center gap-2 font-semibold text-sm">
															<span className="h-2 w-2 animate-pulse rounded-full bg-destructive"></span>
															Your allergens ({form.state.value.length}):
														</p>
														<div className="flex flex-wrap gap-2">
															{form.state.value.map((allergen, index) => (
																<Badge
																	key={allergen}
																	variant="secondary"
																	className="group py-1.5 pr-2 pl-3 text-sm transition-colors hover:bg-destructive/20"
																>
																	{allergen}
																	<button
																		type="button"
																		aria-label={`Remove ${allergen}`}
																		onClick={() => form.removeValue(index)}
																		className="ml-2 rounded-full p-0.5 transition-colors hover:bg-destructive/30"
																	>
																		<X className="h-3 w-3" />
																	</button>
																</Badge>
															))}
														</div>
													</div>
												)}
											</>
										)}
									</form.AppField>

									<p className="pt-2 text-center text-muted-foreground text-xs">
										You can skip this step if you don't have any allergens
									</p>
								</div>
							)}

							{/* Step 3: Spice Level & Dietary Preferences */}
							{step === 3 && (
								<div className="fade-in slide-in-from-bottom-8 animate-in space-y-6 duration-700">
									<div className="space-y-2 text-center">
										<h2 className="font-bold text-2xl">
											Tell us about your preferences
										</h2>
										<p className="text-muted-foreground">
											This helps us suggest recipes you'll love
										</p>
									</div>

									<div className="space-y-6">
										<form.AppField name="spiceLevel">
											{(form) => (
												<div className="space-y-4">
													<Label className="block text-center font-semibold text-base">
														How spicy do you like your food?
													</Label>
													<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
														{SPICE_LEVELS.map((level, idx) => (
															<button
																type="button"
																key={level.value}
																onClick={() => form.handleChange(level.value)}
																style={{ animationDelay: `${idx * 50}ms` }}
																className={`group fade-in slide-in-from-bottom-4 relative animate-in overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-300 ${
																	form.state.value === level.value
																		? "scale-110 border-primary bg-linear-to-br from-primary/10 to-primary/5 shadow-lg"
																		: "border-border hover:scale-105 hover:border-primary/50"
																}`}
															>
																<div className="relative z-10">
																	<div className="mb-2 transform text-3xl transition-transform group-hover:scale-110">
																		{level.emoji}
																	</div>
																	<div className="mb-0.5 font-semibold text-sm">
																		{level.label}
																	</div>
																	<div className="text-muted-foreground text-xs">
																		{level.desc}
																	</div>
																</div>
																{form.state.value === level.value && (
																	<div className="absolute inset-0 animate-pulse bg-primary/10"></div>
																)}
															</button>
														))}
													</div>
												</div>
											)}
										</form.AppField>

										<form.AppField name="dietaryPreferences" mode="array">
											{(form) => (
												<div className="space-y-4">
													<Label className="block text-center font-semibold text-base">
														Any dietary preferences?
													</Label>
													<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
														{DIETARY_OPTIONS.map((pref) => (
															<button
																type="button"
																key={pref}
																onClick={() => {
																	if (form.state.value.includes(pref)) {
																		const index =
																			form.state.value.indexOf(pref);
																		form.removeValue(index);
																	} else {
																		form.pushValue(pref);
																	}
																}}
																className={`group relative overflow-hidden rounded-lg border-2 px-4 py-3 font-medium text-sm transition-all duration-300 ${
																	form.state.value.includes(pref)
																		? "scale-105 border-primary bg-linear-to-br from-primary/10 to-primary/5 shadow-md"
																		: "border-border hover:border-primary/50"
																}`}
															>
																<span className="relative z-10 flex items-center justify-center gap-1">
																	{pref}
																	{form.state.value.includes(pref) && (
																		<Check className="h-3 w-3" />
																	)}
																</span>
																<div className="absolute inset-0 translate-x-full bg-primary/5 transition-transform duration-300 group-hover:translate-x-0"></div>
															</button>
														))}
													</div>

													<div className="flex gap-2 pt-2">
														<Input
															type="text"
															placeholder="Add custom preference (e.g., Gluten-free, Organic...)"
															value={customDietary}
															onChange={(e) => setCustomDietary(e.target.value)}
															onKeyDown={(e) => {
																if (e.key === "Enter") {
																	e.preventDefault();
																	const value = customDietary.trim();
																	if (!value) return;
																	form.pushValue(value);
																	setCustomDietary("");
																}
															}}
															className="h-10 flex-1"
														/>
														<Button
															type="button"
															onClick={() => {
																const value = customDietary.trim();
																if (!value) return;
																form.pushValue(value);
																setCustomDietary("");
															}}
															disabled={!customDietary.trim()}
															size="sm"
															className="h-10"
														>
															<Plus className="mr-1 h-4 w-4" />
															Add
														</Button>
													</div>

													{form.state.value.length > 0 && (
														<div className="flex flex-wrap gap-2 pt-2">
															{form.state.value.map((pref, index) => (
																<Badge
																	key={pref}
																	variant="outline"
																	className="border-primary/50 py-1.5 pr-2 pl-3"
																>
																	{pref}
																	<button
																		type="button"
																		aria-label={`Remove ${pref}`}
																		onClick={() => form.removeValue(index)}
																		className="ml-2 rounded-full p-0.5 transition-colors hover:bg-destructive/30"
																	>
																		<X className="h-3 w-3" />
																	</button>
																</Badge>
															))}
														</div>
													)}
												</div>
											)}
										</form.AppField>
									</div>
								</div>
							)}

							{/* Step 4: Food Likes/Dislikes */}
							{step === 4 && (
								<div className="fade-in slide-in-from-bottom-8 animate-in space-y-6 duration-700">
									<div className="space-y-2 text-center">
										<h2 className="font-bold text-2xl">Almost there!</h2>
										<p className="text-muted-foreground">
											Tell us about your food preferences to get better recipe
											suggestions
										</p>
									</div>

									<div className="space-y-5">
										<form.AppField name="likedFoods">
											{(form) => (
												<div className="space-y-3">
													<Label
														htmlFor="liked-foods"
														className="flex items-center gap-2 font-semibold text-base"
													>
														<span className="text-2xl">😍</span>
														Foods you love
													</Label>
													<p className="text-muted-foreground text-xs">
														Separate multiple items with commas (e.g., chicken,
														pasta, broccoli)
													</p>
													<TextArea
														id="liked-foods"
														placeholder="chicken, pasta, tomatoes, garlic, avocado..."
														value={form.state.value}
														onChange={(e) => form.handleChange(e.target.value)}
														rows={4}
														className="resize-none text-base"
													/>
												</div>
											)}
										</form.AppField>
										<form.AppField name="dislikedFoods">
											{(form) => (
												<div className="space-y-3">
													<Label
														htmlFor="disliked-foods"
														className="flex items-center gap-2 font-semibold text-base"
													>
														<span className="text-2xl">🚫</span>
														Foods you'd rather avoid
													</Label>
													<p className="text-muted-foreground text-xs">
														Separate multiple items with commas
													</p>
													<TextArea
														id="disliked-foods"
														placeholder="mushrooms, olives, cilantro..."
														value={form.state.value}
														onChange={(e) => form.handleChange(e.target.value)}
														rows={4}
														className="resize-none text-base"
													/>
												</div>
											)}
										</form.AppField>
									</div>
								</div>
							)}
							{step === 5 && (
								<div className="fade-in slide-in-from-bottom-8 animate-in space-y-6 duration-700">
									<div className="space-y-2 text-center">
										<h2 className="font-bold text-2xl">summary</h2>
										<p className="text-muted-foreground">
											Review the details we gathered together
										</p>
									</div>
									<form.Subscribe selector={(state) => state.values}>
										{({ allergens, dietaryPreferences, spiceLevel }) => (
											<div className="space-y-4 rounded-xl border-2 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-6">
												<p className="flex items-center gap-2 font-bold text-base">
													<Sparkles className="h-5 w-5 text-primary" />
													Your Profile Summary
												</p>
												{allergens.length > 0 && (
													<div>
														<p className="mb-2 font-semibold text-muted-foreground text-sm">
															Allergens:
														</p>
														<div className="flex flex-wrap gap-2">
															{allergens.map((allergen) => (
																<Badge
																	key={allergen}
																	variant="destructive"
																	className="text-xs"
																>
																	{allergen}
																</Badge>
															))}
														</div>
													</div>
												)}
												{dietaryPreferences.length > 0 && (
													<div>
														<p className="mb-2 font-semibold text-muted-foreground text-sm">
															Dietary Preferences:
														</p>
														<div className="flex flex-wrap gap-2">
															{dietaryPreferences.map((pref) => (
																<Badge key={pref} className="text-xs">
																	{pref}
																</Badge>
															))}
														</div>
													</div>
												)}
												{spiceLevel && (
													<div>
														<p className="mb-2 font-semibold text-muted-foreground text-sm">
															Spice Level:
														</p>
														<Badge variant="outline" className="text-xs">
															{
																SPICE_LEVELS.find((l) => l.value === spiceLevel)
																	?.emoji
															}{" "}
															{
																SPICE_LEVELS.find((l) => l.value === spiceLevel)
																	?.label
															}
														</Badge>
													</div>
												)}
											</div>
										)}
									</form.Subscribe>
								</div>
							)}

							<div className="flex justify-between border-t-2 pt-6">
								{step > 1 ? (
									<Button
										type="button"
										variant="outline"
										onClick={() => setStep(step - 1)}
										size="lg"
										className="gap-2"
									>
										<ArrowLeft className="h-4 w-4" />
										Back
									</Button>
								) : (
									<div />
								)}

								{step < totalSteps ? (
									<Button
										type="button"
										onClick={() => setStep(step + 1)}
										size="lg"
										className="gap-2 shadow-lg"
									>
										Next
										<ArrowRight className="h-4 w-4" />
									</Button>
								) : (
									<Button
										type="submit"
										key="submit button"
										size="lg"
										className="gap-2 bg-linear-to-r from-primary to-primary/80 shadow-lg"
									>
										<Sparkles className="h-4 w-4" />
										Complete Setup
										<Check className="h-4 w-4" />
									</Button>
								)}
							</div>
						</form.AppForm>
					</CardContent>
				</Card>
			</div>
		</form>
	);
}
