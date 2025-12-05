import { Obj } from "@plateful/utils";
import { type Unit, UnitCategory } from "./enums";
import { aliasesByMassUnit, massUnits } from "./features/mass";
import { temperatureUnits } from "./features/temperature";
import { aliasesByVolumeUnit, volumeUnits } from "./features/volume";

export const unitsByCategory = {
	[UnitCategory.Mass]: massUnits,
	[UnitCategory.Volume]: volumeUnits,
	[UnitCategory.Temperature]: temperatureUnits,
} as const satisfies Record<UnitCategory, Unit[]>;

export const aliasesByUnit = Obj.merge(
	aliasesByMassUnit,
	aliasesByVolumeUnit,
) satisfies Partial<Record<Unit, string[]>>;
