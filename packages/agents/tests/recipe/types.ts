import type { LanguageModel, StepResult, ToolSet } from "ai";
import type { Evalite } from "evalite";

import type {
	RecipeGraph,
	RecipeValidationIssue,
	UnreachableMaterialError,
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
	steps: StepResult<ToolSet>[];
	recipe: RecipeGenOutput;
};
export type RecipeGenEvalOutput = RecipeModelResponse & {
	recipeGraph: RecipeGraph;
};

export type RecipeGenEvalVariant =
	| { isDummy?: false; model: LanguageModel }
	| {
			isDummy: true;
			res: RecipeModelResponse;
	  };

export type EvalVariant = {
	name: string;
	input: RecipeGenEvalVariant;
	only?: boolean;
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
		[UnreachableMaterialError._tag]: {
			count: number;
			materials: string[];
		};
		UnusedIngredients: {
			ingredients: {
				count: number;
				unused: {
					count: number;
					names: string[];
				};
			};
			agentNotes: string | null;
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
		issues?: ScoreMetadata<T extends RecipeValidationIssue ? T["_tag"] : T>[];
	};
};
