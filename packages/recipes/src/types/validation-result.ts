import type { RecipeValidationError, RecipeValidationIssue } from "../models";

export type RecipeValidationResult<
	Issue extends RecipeValidationIssue = RecipeValidationIssue,
	Data = null,
> = Data | RecipeValidationError<Issue>;
