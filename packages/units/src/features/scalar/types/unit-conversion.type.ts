import type { UnitConversion } from "../../../types";

export type ScalarUnitConversion<UnitSymbol extends string = string> =
	UnitConversion<{ by: number; isLossy?: boolean }, UnitSymbol>;
