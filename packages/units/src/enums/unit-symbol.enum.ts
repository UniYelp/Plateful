import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";
import { MassSymbol } from "../features/mass";
import { TemperatureSymbol } from "../features/temperature";
import { VolumeSymbol } from "../features/volume";
import type { Unit } from "./unit.enum";

export const UnitSymbol = Enum.merge(
	MassSymbol,
	VolumeSymbol,
	TemperatureSymbol,
) satisfies Record<Unit, string>;
export type UnitSymbol = ValueOf<typeof UnitSymbol>;

export const unitSymbols = Enum.toTuple(UnitSymbol);
