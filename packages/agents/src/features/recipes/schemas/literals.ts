import z from "zod";

import { IngredientUnit } from "@plateful/ingredients";
import { RecipeSpiceLevel } from "@plateful/recipes";
import { TemperatureUnit } from "@plateful/units/temperature";

export const SpiceLevelSchema = z.enum(RecipeSpiceLevel).meta({
	title: "Spice Level",
	description: "Tolerated recipe spice-level",
});

export const TemperatureUnitSchema = z.enum(TemperatureUnit).meta({
	title: "Temperature Unit",
});

export const MaterialUnitSchema = z.enum(IngredientUnit).meta({
	title: "Material Unit",
});
