import type { LanguageModel, StepResult, ToolSet } from "ai";
import type { Evalite } from "evalite";

import type {
	RecipeGraph,
	RecipeValidationIssue,
	UsedOutputMaterialError,
} from "@plateful/recipes";
import type { Satisfies, SuggestStr } from "@plateful/types";
import type {
	RecipeGenInput,
	RecipeGenOutput,
} from "../../src/features/recipes";

export type RecipeGenEvalInput = RecipeGenInput;

type RecipeModelResponse = {
	text: string;
	output: RecipeGenOutput;
	steps: StepResult<ToolSet>[];
};
export type RecipeGenEvalOutput = RecipeModelResponse & {
	recipeGraph: RecipeGraph;
};

export type RecipeGenEvalVariant =
	| { isDummy: false; model: LanguageModel }
	| {
			isDummy: true;
			res: RecipeModelResponse;
	  };

type BaseScoreIssueMetadata<Issue extends string = string> = {
	title: Issue;
	description: string;
	[x: PropertyKey]: unknown;
};

type ScoreMetadataByIssue = Satisfies<
	{
		[UsedOutputMaterialError._tag]: {
			count: number;
			outputs: number;
			materials: string[];
		};
		[x: string]: unknown;
	},
	Partial<{
		[Issue in RecipeValidationIssue as Issue["_tag"]]: unknown;
	}>
>;

type ScoreMetadata<T extends SuggestStr<RecipeValidationIssue["_tag"]>> =
	BaseScoreIssueMetadata<T> & ScoreMetadataByIssue[T];

export type RecipeGenScore<
	T extends string | RecipeValidationIssue = string | RecipeValidationIssue,
> = Evalite.UserProvidedScoreWithMetadata & {
	metadata?: {
		issue?: ScoreMetadata<
			T extends RecipeValidationIssue
				? T["_tag"]
				: string
		>;
	};
};
