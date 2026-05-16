import type { ValueOf } from "@plateful/types";

export const AIStatus = {
	Ready: "ready",
	Loading: "loading",
	Error: "error",
	None: "none",
	Disabled: "disabled",
} as const;

export type AIStatus = ValueOf<typeof AIStatus>;
