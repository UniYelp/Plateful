import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const RecipeDurationKind = {
	Prep: "prep",
	Cook: "cook",
} as const;

export type RecipeDurationKind = ValueOf<typeof RecipeDurationKind>;

export const recipeDurationKinds = Enum.toTuple(RecipeDurationKind);
