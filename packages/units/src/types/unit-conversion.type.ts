export type UnitConversion<ConversionData, Unit extends string = string> = {
	from: Unit;
	to: Unit;
} & ConversionData;
