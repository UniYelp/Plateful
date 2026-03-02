import type { RecipeValidationError, RecipeValidationIssue } from "../models";

export type RecipeValidationResult<
	Issue extends RecipeValidationIssue = RecipeValidationIssue,
	Data = true,
> = Data | RecipeValidationError<Issue>;
