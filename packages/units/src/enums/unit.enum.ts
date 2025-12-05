import type { ValueOf } from "@plateful/types";
import { MassUnit } from "../features/mass";
import { TemperatureUnit } from "../features/temperature/enums/unit.enum";
import { VolumeUnit } from "../features/volume";

export const Unit = {
	...MassUnit,
	...VolumeUnit,
	...TemperatureUnit,
} as const;

export type Unit = ValueOf<typeof Unit>;
