import type { UnNest } from "@plateful/types";
import type { RecipeGenShape } from "@backend/recipeGens";

export type QuickTag = {label: string; value: string; icon: string}


export type RecipeGenState<
    Status extends RecipeGenShape["state"]["status"],
    Gen extends RecipeGenShape = RecipeGenShape,
> = Extract<
    UnNest<Gen, "state">,
    { state: Extract<Gen["state"], { status: Status }> }
>;