import type { ValueOf } from "@plateful/types";

export const UnitCategory = {
	Mass: "Mass",
	Volume: "Volume",
	Temperature: "Temperature",
} as const;

export type UnitCategory = ValueOf<typeof UnitCategory>;
